import {
  Component,
  OnDestroy,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SidebarComponent } from '../shared/sidebar.component';
import { TALK_INTENTS, matchTalkIntent } from './talk-intents';

/** Minimal typings for browser SpeechRecognition (Chrome / Edge). */
interface SpeechRecognitionResultLike {
  readonly isFinal: boolean;
  readonly 0: { readonly transcript: string };
}

interface SpeechRecognitionEventLike {
  readonly results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: ((ev: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

@Component({
  selector: 'app-talk',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, TranslateModule],
  template: `
    <app-sidebar>
      <div class="talk-page" data-testid="talk-page">
        <div class="page-header">
          <h1>{{ 'TALK.TITLE' | translate }}</h1>
          <p class="subtitle">{{ 'TALK.SUBTITLE' | translate }}</p>
        </div>

        <p class="hint">{{ 'TALK.HINT' | translate }}</p>

        <div class="examples" data-testid="talk-examples">
          <p class="examples-label">{{ 'TALK.EXAMPLES_LABEL' | translate }}</p>
          <ul>
            @for (ex of examplePhrases; track ex) {
              <li>
                <button type="button" class="example-chip" (click)="runTyped(ex)">{{ ex }}</button>
              </li>
            }
          </ul>
        </div>

        <div class="voice-row">
          @if (speechSupported()) {
            <button
              type="button"
              class="btn btn-primary"
              data-testid="talk-listen"
              [attr.aria-pressed]="listening()"
              (click)="toggleListen()"
            >
              {{ listening() ? ('TALK.STOP' | translate) : ('TALK.LISTEN' | translate) }}
            </button>
          } @else {
            <p class="hint" data-testid="talk-no-speech">{{ 'TALK.NO_SPEECH' | translate }}</p>
          }
        </div>

        <form class="typed-form" (ngSubmit)="submitTyped()" data-testid="talk-typed-form">
          <label class="typed-label" for="talk-command">{{ 'TALK.TYPED_LABEL' | translate }}</label>
          <div class="typed-row">
            <input
              id="talk-command"
              name="talkCommand"
              type="text"
              class="typed-input"
              data-testid="talk-command-input"
              [(ngModel)]="typedCommand"
              [placeholder]="'TALK.TYPED_PLACEHOLDER' | translate"
              autocomplete="off"
            />
            <button type="submit" class="btn btn-secondary" data-testid="talk-go">
              {{ 'TALK.GO' | translate }}
            </button>
          </div>
        </form>

        @if (lastHeard()) {
          <p class="status" data-testid="talk-last-heard">
            {{ 'TALK.LAST_HEARD' | translate: { text: lastHeard() } }}
          </p>
        }
        @if (statusKey()) {
          <p class="status" [class.status-error]="statusIsError()" data-testid="talk-status">
            {{ statusKey()! | translate: statusParams() }}
          </p>
        }
      </div>
    </app-sidebar>
  `,
  styleUrl: './talk.component.scss',
})
export class TalkComponent implements OnDestroy {
  private readonly router = inject(Router);
  private recognition: SpeechRecognitionLike | null = null;

  readonly examplePhrases = TALK_INTENTS.slice(0, 6).map((i) => i.phrases[0]);
  readonly speechSupported = signal(false);
  readonly listening = signal(false);
  readonly lastHeard = signal('');
  readonly statusKey = signal<string | null>(null);
  readonly statusIsError = signal(false);
  readonly statusParams = signal<Record<string, string>>({});

  typedCommand = '';

  constructor() {
    afterNextRender(() => {
      this.speechSupported.set(!!getSpeechRecognitionCtor());
    });
  }

  ngOnDestroy(): void {
    this.stopRecognition(true);
  }

  toggleListen(): void {
    if (this.listening()) {
      this.stopRecognition(false);
      return;
    }
    this.startRecognition();
  }

  submitTyped(): void {
    this.runTyped(this.typedCommand);
  }

  runTyped(raw: string): void {
    const text = (raw || '').trim();
    if (!text) {
      this.setStatus('TALK.ERR_EMPTY', true);
      return;
    }
    this.lastHeard.set(text);
    this.applyUtterance(text);
  }

  private startRecognition(): void {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      this.setStatus('TALK.NO_SPEECH', true);
      return;
    }
    this.stopRecognition(true);
    const rec = new Ctor();
    rec.lang = typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'en-US';
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (ev) => {
      const result = ev.results?.[0];
      const transcript = result?.[0]?.transcript?.trim() || '';
      if (transcript) {
        this.lastHeard.set(transcript);
        this.applyUtterance(transcript);
      }
    };
    rec.onerror = (ev) => {
      const code = ev?.error || 'unknown';
      if (code === 'aborted' || code === 'no-speech') {
        this.listening.set(false);
        return;
      }
      this.setStatus('TALK.ERR_SPEECH', true, { code });
      this.listening.set(false);
    };
    rec.onend = () => {
      this.listening.set(false);
    };
    this.recognition = rec;
    try {
      rec.start();
      this.listening.set(true);
      this.setStatus('TALK.LISTENING', false);
    } catch {
      this.setStatus('TALK.ERR_SPEECH', true, { code: 'start' });
      this.listening.set(false);
    }
  }

  private stopRecognition(abort: boolean): void {
    const rec = this.recognition;
    this.recognition = null;
    this.listening.set(false);
    if (!rec) return;
    try {
      if (abort) rec.abort();
      else rec.stop();
    } catch {
      /* ignore */
    }
  }

  private applyUtterance(utterance: string): void {
    const intent = matchTalkIntent(utterance);
    if (!intent) {
      this.setStatus('TALK.ERR_NO_MATCH', true);
      return;
    }
    this.setStatus('TALK.MATCHED', false, { intent: intent.id, route: intent.route });
    void this.router.navigateByUrl(intent.route);
  }

  private setStatus(key: string, isError: boolean, params: Record<string, string> = {}): void {
    this.statusKey.set(key);
    this.statusIsError.set(isError);
    this.statusParams.set(params);
  }
}

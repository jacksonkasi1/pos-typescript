/**
 * Warehouses Component
 *
 * Manage tenant stock locations (almacenes).
 */

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SidebarComponent } from '../../shared/sidebar.component';
import { FocusFirstInputDirective } from '../../shared/focus-first-input.directive';
import { InventoryService } from '../inventory.service';
import { Warehouse, WarehouseCreate, WarehouseUpdate } from '../inventory.types';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-warehouses',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SidebarComponent, FocusFirstInputDirective, TranslateModule],
  template: `
    <app-sidebar>
      <div class="page-header">
        <h1>{{ 'INVENTORY.WAREHOUSES.TITLE' | translate }}</h1>
        @if (!showModal()) {
          <button class="btn btn-primary" (click)="openCreateModal()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            {{ 'INVENTORY.WAREHOUSES.ADD_WAREHOUSE' | translate }}
          </button>
        }
      </div>

      <div class="content">
        @if (error()) {
          <div class="error-banner">
            <span>{{ error() }}</span>
            <button class="icon-btn" (click)="error.set('')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        }

        @if (loading()) {
          <div class="empty-state">
            <p>{{ 'INVENTORY.WAREHOUSES.LOADING' | translate }}</p>
          </div>
        } @else if (warehouses().length === 0) {
          <div class="empty-state">
            <h3>{{ 'INVENTORY.WAREHOUSES.NO_WAREHOUSES_YET' | translate }}</h3>
            <p>{{ 'INVENTORY.WAREHOUSES.NO_WAREHOUSES_DESC' | translate }}</p>
            <button class="btn btn-primary" (click)="openCreateModal()">{{ 'INVENTORY.WAREHOUSES.ADD_WAREHOUSE' | translate }}</button>
          </div>
        } @else {
          <div class="table-card">
            <table>
              <thead>
                <tr>
                  <th>{{ 'INVENTORY.WAREHOUSES.CODE' | translate }}</th>
                  <th>{{ 'INVENTORY.WAREHOUSES.NAME' | translate }}</th>
                  <th>{{ 'INVENTORY.WAREHOUSES.DEFAULT' | translate }}</th>
                  <th>{{ 'INVENTORY.WAREHOUSES.STATUS' | translate }}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @for (warehouse of warehouses(); track warehouse.id) {
                  <tr>
                    <td class="code-cell">{{ warehouse.code || '-' }}</td>
                    <td>{{ warehouse.name }}</td>
                    <td>
                      @if (warehouse.is_default) {
                        <span class="status-badge success">{{ 'INVENTORY.WAREHOUSES.DEFAULT_BADGE' | translate }}</span>
                      } @else {
                        <span>-</span>
                      }
                    </td>
                    <td>
                      <span class="status-badge" [class.success]="warehouse.is_active">
                        {{ warehouse.is_active ? ('INVENTORY.WAREHOUSES.ACTIVE' | translate) : ('INVENTORY.WAREHOUSES.INACTIVE' | translate) }}
                      </span>
                    </td>
                    <td class="actions">
                      <button class="icon-btn" [title]="'INVENTORY.COMMON.EDIT' | translate" (click)="openEditModal(warehouse)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      @if (!warehouse.is_default) {
                        <button class="icon-btn icon-btn-danger" [title]="'INVENTORY.COMMON.DELETE' | translate" (click)="confirmDelete(warehouse)">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                          </svg>
                        </button>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      @if (showModal()) {
        <div class="modal-overlay">
          <div class="modal" (click)="$event.stopPropagation()" appFocusFirstInput>
            <div class="form-header">
              <h3>{{ editingWarehouse() ? ('INVENTORY.WAREHOUSES.EDIT_WAREHOUSE' | translate) : ('INVENTORY.WAREHOUSES.NEW_WAREHOUSE' | translate) }}</h3>
              <button class="icon-btn" (click)="closeModal()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <form [formGroup]="form" (ngSubmit)="saveWarehouse()">
              <div class="form-row">
                <div class="form-group form-group-sm">
                  <label for="wh_code">{{ 'INVENTORY.WAREHOUSES.CODE' | translate }}</label>
                  <input type="text" id="wh_code" formControlName="code" placeholder="COLD" />
                </div>
                <div class="form-group">
                  <label for="wh_name">{{ 'INVENTORY.WAREHOUSES.NAME' | translate }}</label>
                  <input type="text" id="wh_name" formControlName="name" required />
                </div>
              </div>
              <div class="form-group">
                <label class="checkbox-label">
                  <input type="checkbox" formControlName="is_default" />
                  <span>{{ 'INVENTORY.WAREHOUSES.SET_AS_DEFAULT' | translate }}</span>
                </label>
              </div>
              @if (editingWarehouse()) {
                <div class="form-group">
                  <label class="checkbox-label">
                    <input type="checkbox" formControlName="is_active" />
                    <span>{{ 'INVENTORY.WAREHOUSES.WAREHOUSE_IS_ACTIVE' | translate }}</span>
                  </label>
                </div>
              }
              <div class="form-actions">
                <button type="button" class="btn btn-secondary" (click)="closeModal()">{{ 'INVENTORY.COMMON.CANCEL' | translate }}</button>
                <button type="submit" class="btn btn-primary" [disabled]="!form.valid || saving()">
                  {{ saving() ? ('INVENTORY.COMMON.SAVING' | translate) : (editingWarehouse() ? ('INVENTORY.COMMON.UPDATE' | translate) : ('INVENTORY.COMMON.CREATE' | translate)) }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      @if (showDeleteModal()) {
        <div class="modal-overlay" (click)="showDeleteModal.set(false)">
          <div class="modal modal-sm" (click)="$event.stopPropagation()">
            <h3>{{ 'INVENTORY.WAREHOUSES.DELETE_WAREHOUSE' | translate }}</h3>
            <p>{{ 'INVENTORY.WAREHOUSES.DELETE_CONFIRM' | translate:{ name: deletingWarehouse()?.name } }}</p>
            <div class="modal-actions">
              <button class="btn btn-secondary" (click)="showDeleteModal.set(false)">{{ 'INVENTORY.COMMON.CANCEL' | translate }}</button>
              <button class="btn btn-danger" (click)="deleteWarehouse()" [disabled]="saving()">
                {{ saving() ? ('INVENTORY.ITEMS.DELETING' | translate) : ('INVENTORY.COMMON.DELETE' | translate) }}
              </button>
            </div>
          </div>
        </div>
      }
    </app-sidebar>
  `,
  styleUrl: './warehouses.component.scss'
})
export class WarehousesComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private fb = inject(FormBuilder);

  warehouses = signal<Warehouse[]>([]);
  loading = signal(true);
  saving = signal(false);
  error = signal('');
  showModal = signal(false);
  showDeleteModal = signal(false);
  editingWarehouse = signal<Warehouse | null>(null);
  deletingWarehouse = signal<Warehouse | null>(null);

  form: FormGroup = this.fb.group({
    code: [''],
    name: ['', Validators.required],
    is_default: [false],
    is_active: [true],
  });

  ngOnInit() {
    this.loadWarehouses();
  }

  loadWarehouses() {
    this.loading.set(true);
    this.inventoryService.getWarehouses(false).subscribe({
      next: warehouses => { this.warehouses.set(warehouses); this.loading.set(false); },
      error: err => { this.error.set(err.error?.detail || 'Failed to load warehouses'); this.loading.set(false); }
    });
  }

  openCreateModal() {
    this.editingWarehouse.set(null);
    this.form.reset({ code: '', name: '', is_default: false, is_active: true });
    this.showModal.set(true);
  }

  openEditModal(warehouse: Warehouse) {
    this.editingWarehouse.set(warehouse);
    this.form.patchValue({
      code: warehouse.code || '',
      name: warehouse.name,
      is_default: warehouse.is_default,
      is_active: warehouse.is_active,
    });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingWarehouse.set(null);
  }

  confirmDelete(warehouse: Warehouse) {
    this.deletingWarehouse.set(warehouse);
    this.showDeleteModal.set(true);
  }

  saveWarehouse() {
    if (!this.form.valid) return;
    this.saving.set(true);
    const data = this.form.value;

    if (this.editingWarehouse()) {
      const updates: WarehouseUpdate = {
        name: data.name,
        code: data.code || null,
        is_active: data.is_active,
        is_default: data.is_default ? true : undefined,
      };
      this.inventoryService.updateWarehouse(this.editingWarehouse()!.id, updates).subscribe({
        next: () => { this.saving.set(false); this.closeModal(); this.loadWarehouses(); },
        error: err => { this.error.set(err.error?.detail || 'Failed to update'); this.saving.set(false); }
      });
    } else {
      const create: WarehouseCreate = {
        name: data.name,
        code: data.code || null,
        is_default: !!data.is_default,
      };
      this.inventoryService.createWarehouse(create).subscribe({
        next: () => { this.saving.set(false); this.closeModal(); this.loadWarehouses(); },
        error: err => { this.error.set(err.error?.detail || 'Failed to create'); this.saving.set(false); }
      });
    }
  }

  deleteWarehouse() {
    if (!this.deletingWarehouse()) return;
    this.saving.set(true);
    this.inventoryService.deleteWarehouse(this.deletingWarehouse()!.id).subscribe({
      next: () => { this.saving.set(false); this.showDeleteModal.set(false); this.deletingWarehouse.set(null); this.loadWarehouses(); },
      error: err => { this.error.set(err.error?.detail || 'Delete failed'); this.saving.set(false); }
    });
  }
}

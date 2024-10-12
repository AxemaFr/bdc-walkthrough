import * as i0 from '@angular/core';
import { Injectable, EventEmitter, TemplateRef, Component, ViewEncapsulation, Input, Output, ViewChild, HostBinding, ContentChild, Directive, Inject, Optional, HostListener, NgModule } from '@angular/core';
import { BehaviorSubject, Subject, Subscription, of, merge } from 'rxjs';
import * as _ from 'lodash';
import * as i1 from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import * as i4 from '@angular/material/menu';
import { MatMenu, MAT_MENU_SCROLL_STRATEGY, MatMenuModule } from '@angular/material/menu';
import * as i2 from '@angular/common';
import { CommonModule } from '@angular/common';
import * as i3 from '@angular/material/button';
import { MatButtonModule } from '@angular/material/button';
import * as i2$1 from '@angular/cdk/overlay';
import { OverlayConfig } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { takeUntil, filter, take } from 'rxjs/operators';
import * as i3$1 from '@angular/cdk/bidi';

class BdcWalkService {
    get disabled() {
        return this._disabled;
    }
    constructor() {
        this._notify = new BehaviorSubject(null);
        this._notifyDisplaying = new Subject();
        this._displaying = {};
        this._version = 1;
        this._key = 'bdcWalkthrough';
        this._disabled = false;
        this.changes = this._notify.asObservable();
        this.changesDisplaying = this._notifyDisplaying.asObservable();
        this._values = JSON.parse(localStorage.getItem(this._key)) || {};
        // reset all values if version is different
        if (this._values.version !== this._version) {
            this.reset();
        }
    }
    migrate(migrations) {
        const version = this._values.migrationVersion || 0;
        migrations.filter(migration => migration.version > version).forEach(migration => {
            console.log(`Running bdc-migration version ${migration.version}`);
            migration.operations.forEach(operation => {
                if (this.evalMustCompleted(operation.condition)) {
                    Object.entries(operation.then).forEach(([id, data]) => {
                        if (data) {
                            this._values[id] = data;
                        }
                        else {
                            delete this._values[id];
                        }
                    });
                }
            });
            this._values.migrationVersion = migration.version;
        });
        this.save();
    }
    getIsDisplaying(id) {
        return this._displaying[id] || false;
    }
    setIsDisplaying(id, visible) {
        if (this._displaying[id] !== visible) {
            if (visible) {
                this._displaying[id] = visible;
            }
            else {
                delete this._displaying[id];
            }
            this._notify.next();
            this._notifyDisplaying.next({ id, visible, action: BdcDisplayEventAction.VisibilityChanged });
        }
    }
    logUserAction(id, action) {
        this._notifyDisplaying.next({ id, visible: false, action });
    }
    getTaskCompleted(id) {
        return this._values[id] || false;
    }
    setTaskCompleted(id, value = true) {
        if (this._values[id] !== value && value) {
            this._values[id] = value;
            this.save();
        }
        else if (this._values.hasOwnProperty(id) && !value) {
            delete this._values[id];
            this.save();
        }
    }
    setTasks(tasks) {
        let changed = false;
        Object.entries(tasks).forEach(([id, data]) => {
            if (this._values[id] !== data && data) {
                this._values[id] = data;
                changed = true;
            }
            else if (this._values.hasOwnProperty(id) && !data) {
                delete this._values[id];
                changed = true;
            }
        });
        if (changed) {
            this.save();
        }
    }
    getTasks() {
        return { ...this._values };
    }
    reset(prefix) {
        if (prefix) {
            // remove only keys prefixed with param
            Object.keys(this._values).filter(key => key.startsWith(prefix)).forEach(keyToRemove => delete this._values[keyToRemove]);
        }
        else {
            // remove all keys
            this._values = { version: this._version };
        }
        this.save();
    }
    disableAll(disabled = true) {
        this._disabled = disabled;
        this._notify.next();
    }
    _isCompleteMatch(name, value) {
        const src = this.getTaskCompleted(name);
        return this._isEqual(src, value) || (typeof (value) === 'object' && _.isMatch(src, value));
    }
    _isEqual(src, value) {
        if (src === value) {
            return true;
        }
        else if (src !== false && value === true) {
            // we can compare value of true with any source
            return true;
        }
        else if (typeof (value) === 'string') {
            // support not (!) less than (<) or greater than (>) comparisons
            const op = value[0];
            const compValue = value.substr(1);
            if ((op === '!' && compValue != src) || (op === '<' && src < compValue) || (op === '>' && src > compValue)) {
                return true;
            }
        }
    }
    evalMustCompleted(mustCompleted) {
        return Object.entries(mustCompleted).find(([name, value]) => !this._isCompleteMatch(name, value)) === undefined;
    }
    evalMustNotDisplaying(mustNotDisplaying) {
        // allow using prefix in task names
        const displaying = Object.keys(this._displaying);
        return mustNotDisplaying.find(prefix => displaying.find(key => key.startsWith(prefix))) === undefined;
    }
    save() {
        localStorage.setItem(this._key, JSON.stringify(this._values));
        this._notify.next();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: BdcWalkService, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: BdcWalkService, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: BdcWalkService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [] });
var BdcDisplayEventAction;
(function (BdcDisplayEventAction) {
    BdcDisplayEventAction[BdcDisplayEventAction["VisibilityChanged"] = 0] = "VisibilityChanged";
    BdcDisplayEventAction[BdcDisplayEventAction["UserClosed"] = 1] = "UserClosed";
    BdcDisplayEventAction[BdcDisplayEventAction["ButtonClicked"] = 2] = "ButtonClicked";
})(BdcDisplayEventAction || (BdcDisplayEventAction = {}));

class BdcWalkDialogComponent {
    constructor(dialog, tutorialService) {
        this.dialog = dialog;
        this.tutorialService = tutorialService;
        this.mustCompleted = {};
        this.mustNotDisplaying = [];
        this.width = '500px';
        this.opened = new EventEmitter();
        this.closed = new EventEmitter();
    }
    ngAfterContentInit() {
        this.componentSubscription = this.tutorialService.changes.subscribe(() => this._sync());
    }
    ngOnChanges() {
        this._sync();
    }
    ngOnDestroy() {
        if (this.componentSubscription) {
            this.componentSubscription.unsubscribe();
        }
        this._close();
    }
    getValue(taskName) {
        return this.tutorialService.getTaskCompleted(taskName);
    }
    close(setTasks = {}) {
        this.tutorialService.logUserAction(this.name, BdcDisplayEventAction.UserClosed);
        this.tutorialService.setTaskCompleted(this.name);
        this.tutorialService.setTasks(setTasks);
    }
    _open() {
        this.dialogRef = this.dialog.open(this.templateRef, { width: this.width, disableClose: true, restoreFocus: false, panelClass: 'bdc-walk-dialog' });
        this.opened.emit();
    }
    _close() {
        if (this.dialogRef) {
            this.dialogRef.close();
            this.dialogRef = null;
            this.closed.emit();
        }
    }
    _sync() {
        if (this.name) {
            if (!this.tutorialService.getTaskCompleted(this.name) &&
                !this.tutorialService.disabled &&
                this.tutorialService.evalMustCompleted(this.mustCompleted) &&
                this.tutorialService.evalMustNotDisplaying(this.mustNotDisplaying)) {
                if (!this.dialogRef) {
                    this._open();
                    this.tutorialService.setIsDisplaying(this.name, true);
                }
            }
            else if (this.dialogRef) {
                this._close();
                this.tutorialService.setIsDisplaying(this.name, false);
            }
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: BdcWalkDialogComponent, deps: [{ token: i1.MatDialog }, { token: BdcWalkService }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.8", type: BdcWalkDialogComponent, selector: "bdc-walk-dialog", inputs: { name: "name", mustCompleted: "mustCompleted", mustNotDisplaying: "mustNotDisplaying", width: "width" }, outputs: { opened: "opened", closed: "closed" }, viewQueries: [{ propertyName: "templateRef", first: true, predicate: TemplateRef, descendants: true, static: true }], usesOnChanges: true, ngImport: i0, template: "<ng-template>\n  <div class=\"container\">\n    <ng-content></ng-content>\n  </div>\n</ng-template>\n", styles: [""], encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: BdcWalkDialogComponent, decorators: [{
            type: Component,
            args: [{ selector: 'bdc-walk-dialog', encapsulation: ViewEncapsulation.None, template: "<ng-template>\n  <div class=\"container\">\n    <ng-content></ng-content>\n  </div>\n</ng-template>\n" }]
        }], ctorParameters: () => [{ type: i1.MatDialog }, { type: BdcWalkService }], propDecorators: { name: [{
                type: Input
            }], mustCompleted: [{
                type: Input
            }], mustNotDisplaying: [{
                type: Input
            }], width: [{
                type: Input
            }], opened: [{
                type: Output
            }], closed: [{
                type: Output
            }], templateRef: [{
                type: ViewChild,
                args: [TemplateRef, { static: true }]
            }] } });

class BdcWalkPopupComponent {
    constructor(tutorialService) {
        this.tutorialService = tutorialService;
        this.xPosition = 'before';
        this.yPosition = 'below';
        this.arrow = true;
        this.horizontal = false;
        this.closeOnClick = false;
        this.offsetX = 0;
        this.offsetY = 0;
        this.class = '';
        this.showCloseButton = true;
        this.showButton = false;
        this.buttonText = 'Got it';
        this.mustCompleted = {};
        this.mustNotDisplaying = [];
        this.onCloseCompleteTask = {};
        this.onButtonCompleteTask = {};
        this.opened = new EventEmitter();
        this.closed = new EventEmitter();
        this.className = undefined;
    }
    ngOnInit() {
    }
    ngOnChanges() {
        if (this.trigger) {
            this.trigger.reposition();
        }
    }
    _getClass() {
        return `bdc-walk-popup ${this.class} ` + (this.arrow ? ' arrow' : '') + (this.horizontal ? ' horizontal' : '');
    }
    getValue(taskName) {
        return this.tutorialService.getTaskCompleted(taskName);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: BdcWalkPopupComponent, deps: [{ token: BdcWalkService }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.8", type: BdcWalkPopupComponent, selector: "bdc-walk-popup", inputs: { name: "name", header: "header", xPosition: "xPosition", yPosition: "yPosition", arrow: "arrow", horizontal: "horizontal", closeOnClick: "closeOnClick", alignCenter: "alignCenter", offsetX: "offsetX", offsetY: "offsetY", class: "class", showCloseButton: "showCloseButton", showButton: "showButton", buttonText: "buttonText", sideNoteText: "sideNoteText", mustCompleted: "mustCompleted", mustNotDisplaying: "mustNotDisplaying", onCloseCompleteTask: "onCloseCompleteTask", onButtonCompleteTask: "onButtonCompleteTask" }, outputs: { opened: "opened", closed: "closed" }, host: { properties: { "attr.class": "this.className" } }, queries: [{ propertyName: "templateRef", first: true, predicate: TemplateRef, descendants: true }], viewQueries: [{ propertyName: "menu", first: true, predicate: MatMenu, descendants: true, static: true }], usesOnChanges: true, ngImport: i0, template: "<mat-menu [overlapTrigger]=\"false\" [xPosition]=\"xPosition\" [yPosition]=\"yPosition\" [hasBackdrop]=\"false\" [class]=\"_getClass()\">\n  <div class=\"container\" (click)=\"$event.stopPropagation()\" (keydown)=\"$event.stopPropagation()\" tabindex=\"-1\">\n    <div class=\"title\">\n      <div class=\"header\">{{ header }}</div>\n\n      <a *ngIf=\"showCloseButton\" (click)=\"$event.preventDefault(); trigger.close(false)\" class=\"close\" href=\"\"></a>\n    </div>\n\n    <ng-content></ng-content>\n\n    <ng-container *ngIf=\"templateRef && trigger\">\n      <ng-container *ngTemplateOutlet=\"templateRef; context: {$implicit: data}\"></ng-container>\n    </ng-container>\n\n    <div *ngIf=\"showButton\" class=\"buttons\">\n      <div class=\"sideNote\">{{ sideNoteText }}</div>\n      <button (click)=\"trigger.close(true)\" type=\"button\" mat-stroked-button>{{ buttonText }}</button>\n    </div>\n  </div>\n</mat-menu>\n", styles: ["div.mat-mdc-menu-panel.bdc-walk-popup,div.mat-menu-panel.bdc-walk-popup{min-height:auto;border:1px solid #E3E4E6;box-shadow:0 2px 2px #0003;overflow:visible;min-width:300px;border-radius:10px}div.mat-mdc-menu-panel.bdc-walk-popup .container,div.mat-menu-panel.bdc-walk-popup .container{padding:10px 18px 16px;outline:none;font-size:14px;line-height:1.35;background:#fff}div.mat-mdc-menu-panel.bdc-walk-popup .title,div.mat-menu-panel.bdc-walk-popup .title{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px}div.mat-mdc-menu-panel.bdc-walk-popup .title .header,div.mat-menu-panel.bdc-walk-popup .title .header{font-size:18px;font-weight:700;color:#0293db}div.mat-mdc-menu-panel.bdc-walk-popup .title a.close,div.mat-menu-panel.bdc-walk-popup .title a.close{margin-right:-4px;width:16px;height:16px;display:block;background:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJub25lIiBkPSJNMCAwaDI0djI0SDBWMHoiLz48cGF0aCBmaWxsPSIjRDVEQUUwIiBkPSJNMTkgNi40MUwxNy41OSA1IDEyIDEwLjU5IDYuNDEgNSA1IDYuNDEgMTAuNTkgMTIgNSAxNy41OSA2LjQxIDE5IDEyIDEzLjQxIDE3LjU5IDE5IDE5IDE3LjU5IDEzLjQxIDEyIDE5IDYuNDF6Ii8+PC9zdmc+);background-size:16px}div.mat-mdc-menu-panel.bdc-walk-popup .buttons,div.mat-menu-panel.bdc-walk-popup .buttons{margin-top:12px;margin-bottom:-5px;display:flex;justify-content:space-between;align-items:center}div.mat-mdc-menu-panel.bdc-walk-popup .buttons .sideNote,div.mat-menu-panel.bdc-walk-popup .buttons .sideNote{color:#b1bcc7;font-size:12px}div.mat-mdc-menu-panel.bdc-walk-popup .buttons button,div.mat-menu-panel.bdc-walk-popup .buttons button{color:#0293db;line-height:30px!important}div.mat-mdc-menu-panel.bdc-walk-popup.mat-menu-above,div.mat-menu-panel.bdc-walk-popup.mat-menu-above{box-shadow:0 0 2px #0003}div.mat-mdc-menu-panel.bdc-walk-popup .mat-mdc-menu-content,div.mat-mdc-menu-panel.bdc-walk-popup .mat-menu-content,div.mat-menu-panel.bdc-walk-popup .mat-mdc-menu-content,div.mat-menu-panel.bdc-walk-popup .mat-menu-content{border-radius:10px;height:100%;padding:0;overflow-y:auto}div.mat-mdc-menu-panel.bdc-walk-popup.arrow,div.mat-menu-panel.bdc-walk-popup.arrow{position:relative}div.mat-mdc-menu-panel.bdc-walk-popup.arrow:after,div.mat-mdc-menu-panel.bdc-walk-popup.arrow:before,div.mat-menu-panel.bdc-walk-popup.arrow:after,div.mat-menu-panel.bdc-walk-popup.arrow:before{bottom:100%;border:solid transparent;content:\" \";height:0;width:0;position:absolute;pointer-events:none}div.mat-mdc-menu-panel.bdc-walk-popup.arrow:after,div.mat-menu-panel.bdc-walk-popup.arrow:after{border-color:#fff0;border-width:8px}div.mat-mdc-menu-panel.bdc-walk-popup.arrow:before,div.mat-menu-panel.bdc-walk-popup.arrow:before{border-color:#e3e4e600;border-width:9px}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-before:not(.horizontal):after,div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-before:not(.horizontal):before,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-before:not(.horizontal):after,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-before:not(.horizontal):before{right:10px}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-before:not(.horizontal):after,div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-before:not(.horizontal):before,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-before:not(.horizontal):after,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-before:not(.horizontal):before{right:20px}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-before:not(.horizontal):before,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-before:not(.horizontal):before{margin-right:-1px}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-after:not(.horizontal):after,div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-after:not(.horizontal):before,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-after:not(.horizontal):after,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-after:not(.horizontal):before{left:10px}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-after:not(.horizontal):after,div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-after:not(.horizontal):before,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-after:not(.horizontal):after,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-after:not(.horizontal):before{left:20px}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-after:not(.horizontal):after,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-after:not(.horizontal):after{margin-left:1px}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-below:not(.horizontal),div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-below:not(.horizontal){margin-top:10px}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-below:not(.horizontal):after,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-below:not(.horizontal):after{border-top-color:transparent;border-bottom-color:#fff}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-below:not(.horizontal):before,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-below:not(.horizontal):before{border-top-color:transparent;border-bottom-color:#e3e4e6}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-above:not(.horizontal),div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-above:not(.horizontal){margin-bottom:10px}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-above:not(.horizontal):after,div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-above:not(.horizontal):before,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-above:not(.horizontal):after,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-above:not(.horizontal):before{top:100%}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-above:not(.horizontal):after,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-above:not(.horizontal):after{border-top-color:#fff;border-bottom-color:transparent}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-above:not(.horizontal):before,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-above:not(.horizontal):before{border-top-color:#e3e4e6;border-bottom-color:transparent}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-before.horizontal,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-before.horizontal{margin-right:15px}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-before.horizontal:after,div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-before.horizontal:before,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-before.horizontal:after,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-before.horizontal:before{left:100%}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-before.horizontal:after,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-before.horizontal:after{border-left-color:#fff;border-right-color:transparent}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-before.horizontal:before,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-before.horizontal:before{border-left-color:#e3e4e6;border-right-color:transparent}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-after.horizontal,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-after.horizontal{margin-left:15px}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-after.horizontal:after,div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-after.horizontal:before,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-after.horizontal:after,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-after.horizontal:before{right:100%}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-after.horizontal:after,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-after.horizontal:after{border-left-color:transparent;border-right-color:#fff}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-after.horizontal:before,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-after.horizontal:before{border-left-color:transparent;border-right-color:#e3e4e6}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-below.horizontal:after,div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-below.horizontal:before,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-below.horizontal:after,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-below.horizontal:before{top:20px}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-below.horizontal:after,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-below.horizontal:after{margin-top:1px}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-above.horizontal:after,div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-above.horizontal:before,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-above.horizontal:after,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-above.horizontal:before{bottom:20px}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-above.horizontal:after,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-above.horizontal:after{margin-bottom:1px}\n"], dependencies: [{ kind: "directive", type: i2.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i2.NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "component", type: i3.MatButton, selector: "    button[mat-button], button[mat-raised-button], button[mat-flat-button],    button[mat-stroked-button]  ", exportAs: ["matButton"] }, { kind: "component", type: i4.MatMenu, selector: "mat-menu", inputs: ["backdropClass", "aria-label", "aria-labelledby", "aria-describedby", "xPosition", "yPosition", "overlapTrigger", "hasBackdrop", "class", "classList"], outputs: ["closed", "close"], exportAs: ["matMenu"] }], encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: BdcWalkPopupComponent, decorators: [{
            type: Component,
            args: [{ selector: 'bdc-walk-popup', encapsulation: ViewEncapsulation.None, template: "<mat-menu [overlapTrigger]=\"false\" [xPosition]=\"xPosition\" [yPosition]=\"yPosition\" [hasBackdrop]=\"false\" [class]=\"_getClass()\">\n  <div class=\"container\" (click)=\"$event.stopPropagation()\" (keydown)=\"$event.stopPropagation()\" tabindex=\"-1\">\n    <div class=\"title\">\n      <div class=\"header\">{{ header }}</div>\n\n      <a *ngIf=\"showCloseButton\" (click)=\"$event.preventDefault(); trigger.close(false)\" class=\"close\" href=\"\"></a>\n    </div>\n\n    <ng-content></ng-content>\n\n    <ng-container *ngIf=\"templateRef && trigger\">\n      <ng-container *ngTemplateOutlet=\"templateRef; context: {$implicit: data}\"></ng-container>\n    </ng-container>\n\n    <div *ngIf=\"showButton\" class=\"buttons\">\n      <div class=\"sideNote\">{{ sideNoteText }}</div>\n      <button (click)=\"trigger.close(true)\" type=\"button\" mat-stroked-button>{{ buttonText }}</button>\n    </div>\n  </div>\n</mat-menu>\n", styles: ["div.mat-mdc-menu-panel.bdc-walk-popup,div.mat-menu-panel.bdc-walk-popup{min-height:auto;border:1px solid #E3E4E6;box-shadow:0 2px 2px #0003;overflow:visible;min-width:300px;border-radius:10px}div.mat-mdc-menu-panel.bdc-walk-popup .container,div.mat-menu-panel.bdc-walk-popup .container{padding:10px 18px 16px;outline:none;font-size:14px;line-height:1.35;background:#fff}div.mat-mdc-menu-panel.bdc-walk-popup .title,div.mat-menu-panel.bdc-walk-popup .title{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px}div.mat-mdc-menu-panel.bdc-walk-popup .title .header,div.mat-menu-panel.bdc-walk-popup .title .header{font-size:18px;font-weight:700;color:#0293db}div.mat-mdc-menu-panel.bdc-walk-popup .title a.close,div.mat-menu-panel.bdc-walk-popup .title a.close{margin-right:-4px;width:16px;height:16px;display:block;background:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJub25lIiBkPSJNMCAwaDI0djI0SDBWMHoiLz48cGF0aCBmaWxsPSIjRDVEQUUwIiBkPSJNMTkgNi40MUwxNy41OSA1IDEyIDEwLjU5IDYuNDEgNSA1IDYuNDEgMTAuNTkgMTIgNSAxNy41OSA2LjQxIDE5IDEyIDEzLjQxIDE3LjU5IDE5IDE5IDE3LjU5IDEzLjQxIDEyIDE5IDYuNDF6Ii8+PC9zdmc+);background-size:16px}div.mat-mdc-menu-panel.bdc-walk-popup .buttons,div.mat-menu-panel.bdc-walk-popup .buttons{margin-top:12px;margin-bottom:-5px;display:flex;justify-content:space-between;align-items:center}div.mat-mdc-menu-panel.bdc-walk-popup .buttons .sideNote,div.mat-menu-panel.bdc-walk-popup .buttons .sideNote{color:#b1bcc7;font-size:12px}div.mat-mdc-menu-panel.bdc-walk-popup .buttons button,div.mat-menu-panel.bdc-walk-popup .buttons button{color:#0293db;line-height:30px!important}div.mat-mdc-menu-panel.bdc-walk-popup.mat-menu-above,div.mat-menu-panel.bdc-walk-popup.mat-menu-above{box-shadow:0 0 2px #0003}div.mat-mdc-menu-panel.bdc-walk-popup .mat-mdc-menu-content,div.mat-mdc-menu-panel.bdc-walk-popup .mat-menu-content,div.mat-menu-panel.bdc-walk-popup .mat-mdc-menu-content,div.mat-menu-panel.bdc-walk-popup .mat-menu-content{border-radius:10px;height:100%;padding:0;overflow-y:auto}div.mat-mdc-menu-panel.bdc-walk-popup.arrow,div.mat-menu-panel.bdc-walk-popup.arrow{position:relative}div.mat-mdc-menu-panel.bdc-walk-popup.arrow:after,div.mat-mdc-menu-panel.bdc-walk-popup.arrow:before,div.mat-menu-panel.bdc-walk-popup.arrow:after,div.mat-menu-panel.bdc-walk-popup.arrow:before{bottom:100%;border:solid transparent;content:\" \";height:0;width:0;position:absolute;pointer-events:none}div.mat-mdc-menu-panel.bdc-walk-popup.arrow:after,div.mat-menu-panel.bdc-walk-popup.arrow:after{border-color:#fff0;border-width:8px}div.mat-mdc-menu-panel.bdc-walk-popup.arrow:before,div.mat-menu-panel.bdc-walk-popup.arrow:before{border-color:#e3e4e600;border-width:9px}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-before:not(.horizontal):after,div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-before:not(.horizontal):before,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-before:not(.horizontal):after,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-before:not(.horizontal):before{right:10px}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-before:not(.horizontal):after,div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-before:not(.horizontal):before,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-before:not(.horizontal):after,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-before:not(.horizontal):before{right:20px}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-before:not(.horizontal):before,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-before:not(.horizontal):before{margin-right:-1px}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-after:not(.horizontal):after,div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-after:not(.horizontal):before,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-after:not(.horizontal):after,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-after:not(.horizontal):before{left:10px}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-after:not(.horizontal):after,div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-after:not(.horizontal):before,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-after:not(.horizontal):after,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-after:not(.horizontal):before{left:20px}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-after:not(.horizontal):after,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-after:not(.horizontal):after{margin-left:1px}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-below:not(.horizontal),div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-below:not(.horizontal){margin-top:10px}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-below:not(.horizontal):after,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-below:not(.horizontal):after{border-top-color:transparent;border-bottom-color:#fff}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-below:not(.horizontal):before,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-below:not(.horizontal):before{border-top-color:transparent;border-bottom-color:#e3e4e6}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-above:not(.horizontal),div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-above:not(.horizontal){margin-bottom:10px}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-above:not(.horizontal):after,div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-above:not(.horizontal):before,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-above:not(.horizontal):after,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-above:not(.horizontal):before{top:100%}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-above:not(.horizontal):after,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-above:not(.horizontal):after{border-top-color:#fff;border-bottom-color:transparent}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-above:not(.horizontal):before,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-above:not(.horizontal):before{border-top-color:#e3e4e6;border-bottom-color:transparent}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-before.horizontal,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-before.horizontal{margin-right:15px}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-before.horizontal:after,div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-before.horizontal:before,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-before.horizontal:after,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-before.horizontal:before{left:100%}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-before.horizontal:after,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-before.horizontal:after{border-left-color:#fff;border-right-color:transparent}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-before.horizontal:before,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-before.horizontal:before{border-left-color:#e3e4e6;border-right-color:transparent}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-after.horizontal,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-after.horizontal{margin-left:15px}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-after.horizontal:after,div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-after.horizontal:before,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-after.horizontal:after,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-after.horizontal:before{right:100%}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-after.horizontal:after,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-after.horizontal:after{border-left-color:transparent;border-right-color:#fff}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-after.horizontal:before,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-after.horizontal:before{border-left-color:transparent;border-right-color:#e3e4e6}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-below.horizontal:after,div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-below.horizontal:before,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-below.horizontal:after,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-below.horizontal:before{top:20px}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-below.horizontal:after,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-below.horizontal:after{margin-top:1px}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-above.horizontal:after,div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-above.horizontal:before,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-above.horizontal:after,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-above.horizontal:before{bottom:20px}div.mat-mdc-menu-panel.bdc-walk-popup.arrow.mat-menu-above.horizontal:after,div.mat-menu-panel.bdc-walk-popup.arrow.mat-menu-above.horizontal:after{margin-bottom:1px}\n"] }]
        }], ctorParameters: () => [{ type: BdcWalkService }], propDecorators: { name: [{
                type: Input
            }], header: [{
                type: Input
            }], xPosition: [{
                type: Input
            }], yPosition: [{
                type: Input
            }], arrow: [{
                type: Input
            }], horizontal: [{
                type: Input
            }], closeOnClick: [{
                type: Input
            }], alignCenter: [{
                type: Input
            }], offsetX: [{
                type: Input
            }], offsetY: [{
                type: Input
            }], class: [{
                type: Input
            }], showCloseButton: [{
                type: Input
            }], showButton: [{
                type: Input
            }], buttonText: [{
                type: Input
            }], sideNoteText: [{
                type: Input
            }], mustCompleted: [{
                type: Input
            }], mustNotDisplaying: [{
                type: Input
            }], onCloseCompleteTask: [{
                type: Input
            }], onButtonCompleteTask: [{
                type: Input
            }], opened: [{
                type: Output
            }], closed: [{
                type: Output
            }], className: [{
                type: HostBinding,
                args: ['attr.class']
            }], menu: [{
                type: ViewChild,
                args: [MatMenu, { static: true }]
            }], templateRef: [{
                type: ContentChild,
                args: [TemplateRef]
            }] } });

class BdcWalkTriggerDirective {
    /** References the popup instance that the trigger is associated with. */
    get popup() {
        return this._popup;
    }
    set popup(popup) {
        if (popup === this._popup) {
            return;
        }
        this._popup = popup;
        this._menu = popup.menu;
        this._menuCloseSubscription.unsubscribe();
        if (popup) {
            this._menuCloseSubscription = popup.menu.closed.subscribe(() => {
                this._destroyMenu();
            });
        }
    }
    constructor(tutorialService, _overlay, _element, _viewContainerRef, scrollStrategy, _dir, _ngZone) {
        this.tutorialService = tutorialService;
        this._overlay = _overlay;
        this._element = _element;
        this._viewContainerRef = _viewContainerRef;
        this._dir = _dir;
        this._ngZone = _ngZone;
        this._overlayRef = null;
        this._menuOpen = false;
        this._closingActionsSubscription = Subscription.EMPTY;
        this._hoverSubscription = Subscription.EMPTY;
        this._menuCloseSubscription = Subscription.EMPTY;
        this._initialized = false;
        this._contentInited = false;
        this._isTriggerVisible = true;
        this.enabled = true;
        this.mustCompleted = {};
        this._scrollStrategy = scrollStrategy;
    }
    ngAfterContentInit() {
        this._contentInited = true;
        this._componentSubscription = this.tutorialService.changes.subscribe(() => this._sync());
    }
    ngAfterContentChecked() {
        // detect changes if trigger visibility changed
        const isTriggerVisible = !!this._element.nativeElement.offsetParent;
        if (isTriggerVisible !== this._isTriggerVisible && this._contentInited) {
            this._isTriggerVisible = isTriggerVisible;
            this._sync();
        }
    }
    ngOnChanges() {
        if (this._contentInited) {
            this._sync();
        }
    }
    ngOnDestroy() {
        if (this._componentSubscription) {
            this._componentSubscription.unsubscribe();
        }
        // must disable auto-init and release popup so others may use it
        clearTimeout(this._timer);
        if (this._initialized) {
            this.popup.trigger = null;
            this.popup.data = null;
            this.tutorialService.setIsDisplaying(this.popup.name, false);
        }
        if (this._overlayRef) {
            this._overlayRef.dispose();
            this._overlayRef = null;
        }
        this._menuCloseSubscription.unsubscribe();
        this._closingActionsSubscription.unsubscribe();
        this._hoverSubscription.unsubscribe();
    }
    /** Whether the menu is open. */
    get menuOpen() {
        return this._menuOpen;
    }
    /** The text direction of the containing app. */
    get dir() {
        return this._dir && this._dir.value === 'rtl' ? 'rtl' : 'ltr';
    }
    /** Opens the menu. */
    openMenu() {
        const menu = this._menu;
        if (this._menuOpen || !menu) {
            return;
        }
        const overlayRef = this._createOverlay(menu);
        const overlayConfig = overlayRef.getConfig();
        const positionStrategy = overlayConfig.positionStrategy;
        this._setPosition(menu, positionStrategy);
        overlayConfig.hasBackdrop = menu.hasBackdrop;
        overlayRef.attach(this._getPortal(menu));
        if (menu.lazyContent) {
            menu.lazyContent.attach();
        }
        this._closingActionsSubscription = this._menuClosingActions().subscribe(() => this.closeMenu());
        this._initMenu(menu);
        if (menu instanceof MatMenu) {
            menu._startAnimation();
            menu._directDescendantItems.changes.pipe(takeUntil(menu.close)).subscribe(() => {
                // Re-adjust the position without locking when the amount of items
                // changes so that the overlay is allowed to pick a new optimal position.
                positionStrategy.withLockedPosition(false).reapplyLastPosition();
                positionStrategy.withLockedPosition(true);
            });
        }
    }
    /** Closes the menu. */
    closeMenu() {
        this._menu?.close.emit();
    }
    /**
     * Updates the position of the menu to ensure that it fits all options within the viewport.
     */
    updatePosition() {
        this._overlayRef?.updatePosition();
    }
    /** Closes the menu and does the necessary cleanup. */
    _destroyMenu() {
        if (!this._overlayRef || !this.menuOpen) {
            return;
        }
        const menu = this._menu;
        this._closingActionsSubscription.unsubscribe();
        this._overlayRef.detach();
        if (menu instanceof MatMenu) {
            menu._resetAnimation();
            if (menu.lazyContent) {
                // Wait for the exit animation to finish before detaching the content.
                menu._animationDone
                    .pipe(filter(event => event.toState === 'void'), take(1), 
                // Interrupt if the content got re-attached.
                takeUntil(menu.lazyContent._attached))
                    .subscribe({
                    next: () => menu.lazyContent.detach(),
                    // No matter whether the content got re-attached, reset the menu.
                    complete: () => this._setIsMenuOpen(false),
                });
            }
            else {
                this._setIsMenuOpen(false);
            }
        }
        else {
            this._setIsMenuOpen(false);
            menu?.lazyContent?.detach();
        }
    }
    /**
     * This method sets the menu state to open and focuses the first item if
     * the menu was opened via the keyboard.
     */
    _initMenu(menu) {
        menu.direction = this.dir;
        this._setIsMenuOpen(true);
    }
    // set state rather than toggle to support triggers sharing a menu
    _setIsMenuOpen(isOpen) {
        this._menuOpen = isOpen;
    }
    /**
     * This method creates the overlay from the provided menu's template and saves its
     * OverlayRef so that it can be attached to the DOM when openMenu is called.
     */
    _createOverlay(menu) {
        if (!this._overlayRef) {
            const config = this._getOverlayConfig(menu);
            this._subscribeToPositions(menu, config.positionStrategy);
            this._overlayRef = this._overlay.create(config);
        }
        return this._overlayRef;
    }
    /**
     * This method builds the configuration object needed to create the overlay, the OverlayState.
     * @returns OverlayConfig
     */
    _getOverlayConfig(menu) {
        // override overlay to avoid resizing of popups
        const positionStrategy = this._overlay.position()
            .flexibleConnectedTo(this._element)
            .withPush(true)
            .withFlexibleDimensions(false)
            .withTransformOriginOn('.mat-menu-panel, .mat-mdc-menu-panel');
        // patch positionStrategy to disable push for Y axis
        const curGetExactOverlayY = positionStrategy['_getExactOverlayY'];
        positionStrategy['_getExactOverlayY'] = (...args) => {
            const curIsPushed = positionStrategy['_isPushed'];
            positionStrategy['_isPushed'] = false;
            const value = curGetExactOverlayY.call(positionStrategy, ...args);
            positionStrategy['_isPushed'] = curIsPushed;
            return value;
        };
        return new OverlayConfig({
            positionStrategy,
            scrollStrategy: this._scrollStrategy(),
            direction: this._dir
        });
    }
    /**
     * Listens to changes in the position of the overlay and sets the correct classes
     * on the menu based on the new position. This ensures the animation origin is always
     * correct, even if a fallback position is used for the overlay.
     */
    _subscribeToPositions(menu, position) {
        if (menu.setPositionClasses) {
            position.positionChanges.subscribe(change => {
                const posX = change.connectionPair.overlayX === 'start' ? 'after' : 'before';
                const posY = change.connectionPair.overlayY === 'top' ? 'below' : 'above';
                if (!this._lastPosition || this._lastPosition.originX !== change.connectionPair.originX ||
                    this._lastPosition.originY !== change.connectionPair.originY) {
                    // selected position changed, we must run detect changes to update arrow css
                    this._lastPosition = change.connectionPair;
                    // this._ngZone.run(() => setTimeout(() => {}));
                    this._ngZone.run(() => menu.setPositionClasses(posX, posY));
                }
            });
        }
    }
    /**
     * Sets the appropriate positions on a position strategy
     * so the overlay connects with the trigger correctly.
     */
    _setPosition(menu, positionStrategy) {
        // override position strategy to support open to the sides
        let [originX, originFallbackX] = menu.xPosition === 'before' ? ['end', 'start'] : ['start', 'end'];
        const [overlayY, overlayFallbackY] = menu.yPosition === 'above' ? ['bottom', 'top'] : ['top', 'bottom'];
        let [originY, originFallbackY] = [overlayY, overlayFallbackY];
        let [overlayX, overlayFallbackX] = [originX, originFallbackX];
        // align popup's arrow to center of attached element if element size < 70
        const offsetX = this.popup.offsetX || ((this.popup.alignCenter || (this._element.nativeElement.offsetWidth < 130 &&
            this.popup.alignCenter === undefined)) && !this.popup.horizontal ? (this._element.nativeElement.offsetWidth / -2 + 29) *
            (menu.xPosition === 'before' ? 1 : -1) : 0);
        const offsetY = this.popup.offsetY || ((this.popup.alignCenter || (this._element.nativeElement.offsetHeight < 80 &&
            this.popup.alignCenter === undefined)) && this.popup.horizontal ? (this._element.nativeElement.offsetHeight / 2 - 29) *
            (menu.yPosition === 'below' ? 1 : -1) : 0);
        if (this.popup.horizontal) {
            // When the menu is a sub-menu, it should always align itself
            // to the edges of the trigger, instead of overlapping it.
            overlayFallbackX = originX = menu.xPosition === 'before' ? 'start' : 'end';
            originFallbackX = overlayX = originX === 'end' ? 'start' : 'end';
        }
        else if (!menu.overlapTrigger) {
            originY = overlayY === 'top' ? 'bottom' : 'top';
            originFallbackY = overlayFallbackY === 'top' ? 'bottom' : 'top';
        }
        const original = { originX, originY, overlayX, overlayY, offsetX, offsetY };
        const flipX = { originX: originFallbackX, originY, overlayX: overlayFallbackX, overlayY, offsetX: -offsetX, offsetY };
        const flipY = { originX, originY: originFallbackY, overlayX, overlayY: overlayFallbackY, offsetX, offsetY: -offsetY };
        const flipXY = { originX: originFallbackX, originY: originFallbackY, overlayX: overlayFallbackX, overlayY: overlayFallbackY,
            offsetX: -offsetX, offsetY: -offsetY };
        positionStrategy.withPositions(this.popup.horizontal ? [original, flipX] : [original, flipY, flipXY]);
    }
    /** Returns a stream that emits whenever an action that should close the menu occurs. */
    _menuClosingActions() {
        const backdrop = this._overlayRef.backdropClick();
        const detachments = this._overlayRef.detachments();
        const parentClose = of();
        const hover = of();
        return merge(backdrop, parentClose, hover, detachments);
    }
    /** Gets the portal that should be attached to the overlay. */
    _getPortal(menu) {
        // Note that we can avoid this check by keeping the portal on the menu panel.
        // While it would be cleaner, we'd have to introduce another required method on
        // `MatMenuPanel`, making it harder to consume.
        if (!this._portal || this._portal.templateRef !== menu.templateRef) {
            this._portal = new TemplatePortal(menu.templateRef, this._viewContainerRef);
        }
        return this._portal;
    }
    /// custom code
    _click() {
        // element click
        if (this._initialized && this.popup.closeOnClick) {
            this.close(false);
        }
    }
    _sync() {
        const isTriggerVisible = !!this._element.nativeElement.offsetParent;
        if (this._menu && this.popup.name) {
            if (this.enabled && isTriggerVisible && !this.tutorialService.getTaskCompleted(this.popup.name) &&
                !this.tutorialService.disabled &&
                this.tutorialService.evalMustCompleted(this.mustCompleted) &&
                this.tutorialService.evalMustCompleted(this.popup.mustCompleted) &&
                this.tutorialService.evalMustNotDisplaying(this.popup.mustNotDisplaying)) {
                // should be visible, but let's check if popup not already in use by other trigger (in table or ngFor)
                if (!this.popup.trigger) {
                    this._initialized = true;
                    this.popup.trigger = this;
                    this.popup.data = this.data;
                    clearTimeout(this._timer);
                    this._timer = setTimeout(() => this.openMenu(), 500);
                    this.tutorialService.setIsDisplaying(this.popup.name, true);
                    this.popup.opened.emit();
                }
            }
            else if (this._initialized) {
                // only close if this is our popup (initialized)
                this._initialized = false;
                this.popup.trigger = null;
                this.popup.data = null;
                clearTimeout(this._timer);
                this.closeMenu();
                this.tutorialService.setIsDisplaying(this.popup.name, false);
                this.popup.closed.emit();
            }
        }
    }
    reposition() {
        if (this._initialized && this._componentSubscription) {
            this.closeMenu();
            this.openMenu();
        }
    }
    close(buttonClicked) {
        this.tutorialService.logUserAction(this.popup.name, buttonClicked ? BdcDisplayEventAction.ButtonClicked :
            BdcDisplayEventAction.UserClosed);
        this.tutorialService.setTaskCompleted(this.popup.name);
        this.tutorialService.setTasks(this.popup.onCloseCompleteTask);
        if (buttonClicked) {
            this.tutorialService.setTasks(this.popup.onButtonCompleteTask);
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: BdcWalkTriggerDirective, deps: [{ token: BdcWalkService }, { token: i2$1.Overlay }, { token: i0.ElementRef }, { token: i0.ViewContainerRef }, { token: MAT_MENU_SCROLL_STRATEGY }, { token: i3$1.Directionality, optional: true }, { token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.8", type: BdcWalkTriggerDirective, selector: "[bdcWalkTriggerFor]", inputs: { enabled: "enabled", mustCompleted: "mustCompleted", data: "data", popup: ["bdcWalkTriggerFor", "popup"] }, host: { listeners: { "click": "_click()" } }, usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: BdcWalkTriggerDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[bdcWalkTriggerFor]'
                }]
        }], ctorParameters: () => [{ type: BdcWalkService }, { type: i2$1.Overlay }, { type: i0.ElementRef }, { type: i0.ViewContainerRef }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_MENU_SCROLL_STRATEGY]
                }] }, { type: i3$1.Directionality, decorators: [{
                    type: Optional
                }] }, { type: i0.NgZone }], propDecorators: { enabled: [{
                type: Input
            }], mustCompleted: [{
                type: Input
            }], data: [{
                type: Input
            }], popup: [{
                type: Input,
                args: ['bdcWalkTriggerFor']
            }], _click: [{
                type: HostListener,
                args: ['click']
            }] } });

class BdcWalkModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: BdcWalkModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.8", ngImport: i0, type: BdcWalkModule, declarations: [BdcWalkDialogComponent, BdcWalkPopupComponent, BdcWalkTriggerDirective], imports: [CommonModule, MatButtonModule, MatDialogModule, MatMenuModule], exports: [BdcWalkDialogComponent, BdcWalkPopupComponent, BdcWalkTriggerDirective] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: BdcWalkModule, imports: [CommonModule, MatButtonModule, MatDialogModule, MatMenuModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: BdcWalkModule, decorators: [{
            type: NgModule,
            args: [{
                    declarations: [BdcWalkDialogComponent, BdcWalkPopupComponent, BdcWalkTriggerDirective],
                    imports: [
                        CommonModule, MatButtonModule, MatDialogModule, MatMenuModule
                    ],
                    exports: [BdcWalkDialogComponent, BdcWalkPopupComponent, BdcWalkTriggerDirective]
                }]
        }] });

/*
 * Public API Surface of bdc-walkthrough
 */

/**
 * Generated bundle index. Do not edit.
 */

export { BdcDisplayEventAction, BdcWalkDialogComponent, BdcWalkModule, BdcWalkPopupComponent, BdcWalkService, BdcWalkTriggerDirective };
//# sourceMappingURL=bdc-walkthrough.mjs.map

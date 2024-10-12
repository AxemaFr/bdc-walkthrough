import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { BdcDisplayEventAction } from '../bdc-walk.service';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/dialog";
import * as i2 from "../bdc-walk.service";
export class BdcWalkDialogComponent {
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: BdcWalkDialogComponent, deps: [{ token: i1.MatDialog }, { token: i2.BdcWalkService }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.8", type: BdcWalkDialogComponent, selector: "bdc-walk-dialog", inputs: { name: "name", mustCompleted: "mustCompleted", mustNotDisplaying: "mustNotDisplaying", width: "width" }, outputs: { opened: "opened", closed: "closed" }, viewQueries: [{ propertyName: "templateRef", first: true, predicate: TemplateRef, descendants: true, static: true }], usesOnChanges: true, ngImport: i0, template: "<ng-template>\n  <div class=\"container\">\n    <ng-content></ng-content>\n  </div>\n</ng-template>\n", styles: [""], encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: BdcWalkDialogComponent, decorators: [{
            type: Component,
            args: [{ selector: 'bdc-walk-dialog', encapsulation: ViewEncapsulation.None, template: "<ng-template>\n  <div class=\"container\">\n    <ng-content></ng-content>\n  </div>\n</ng-template>\n" }]
        }], ctorParameters: () => [{ type: i1.MatDialog }, { type: i2.BdcWalkService }], propDecorators: { name: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHV0b3JpYWwtZGlhbG9nLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2JkYy13YWxrdGhyb3VnaC9zcmMvbGliL3R1dG9yaWFsLWRpYWxvZy90dXRvcmlhbC1kaWFsb2cuY29tcG9uZW50LnRzIiwiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvYmRjLXdhbGt0aHJvdWdoL3NyYy9saWIvdHV0b3JpYWwtZGlhbG9nL3R1dG9yaWFsLWRpYWxvZy5jb21wb25lbnQuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBRUwsU0FBUyxFQUNULFlBQVksRUFDWixLQUFLLEVBR0wsTUFBTSxFQUNOLFdBQVcsRUFDWCxTQUFTLEVBQUUsaUJBQWlCLEVBQzdCLE1BQU0sZUFBZSxDQUFDO0FBR3ZCLE9BQU8sRUFBQyxxQkFBcUIsRUFBaUIsTUFBTSxxQkFBcUIsQ0FBQzs7OztBQVExRSxNQUFNLE9BQU8sc0JBQXNCO0lBWWpDLFlBQW9CLE1BQWlCLEVBQ2pCLGVBQStCO1FBRC9CLFdBQU0sR0FBTixNQUFNLENBQVc7UUFDakIsb0JBQWUsR0FBZixlQUFlLENBQWdCO1FBWDFDLGtCQUFhLEdBQTBDLEVBQUUsQ0FBQztRQUMxRCxzQkFBaUIsR0FBYSxFQUFFLENBQUM7UUFDakMsVUFBSyxHQUFHLE9BQU8sQ0FBQztRQUNmLFdBQU0sR0FBRyxJQUFJLFlBQVksRUFBUSxDQUFDO1FBQ2xDLFdBQU0sR0FBRyxJQUFJLFlBQVksRUFBUSxDQUFDO0lBT1csQ0FBQztJQUV4RCxrQkFBa0I7UUFDaEIsSUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztJQUMxRixDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNmLENB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VyxFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIEFmdGVyQ29udGVudEluaXQsXG4gIENvbXBvbmVudCxcbiAgRXZlbnRFbWl0dGVyLFxuICBJbnB1dCxcbiAgT25DaGFuZ2VzLFxuICBPbkRlc3Ryb3ksXG4gIE91dHB1dCxcbiAgVGVtcGxhdGVSZWYsXG4gIFZpZXdDaGlsZCwgVmlld0VuY2Fwc3VsYXRpb25cbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge01hdERpYWxvZywgTWF0RGlhbG9nUmVmfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9kaWFsb2cnO1xuaW1wb3J0IHtTdWJzY3JpcHRpb259IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtCZGNEaXNwbGF5RXZlbnRBY3Rpb24sIEJkY1dhbGtTZXJ2aWNlfSBmcm9tICcuLi9iZGMtd2Fsay5zZXJ2aWNlJztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnYmRjLXdhbGstZGlhbG9nJyxcbiAgdGVtcGxhdGVVcmw6ICcuL3R1dG9yaWFsLWRpYWxvZy5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWycuL3R1dG9yaWFsLWRpYWxvZy5jb21wb25lbnQuc2NzcyddLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lXG59KVxuZXhwb3J0IGNsYXNzIEJkY1dhbGtEaWFsb2dDb21wb25lbnQgaW1wbGVtZW50cyBBZnRlckNvbnRlbnRJbml0LCBPbkRlc3Ryb3ksIE9uQ2hhbmdlcyB7XG4gIEBJbnB1dCgpIG5hbWU6IHN0cmluZztcbiAgQElucHV0KCkgbXVzdENvbXBsZXRlZDogeyBbdGFza05hbWU6IHN0cmluZ106IGFueSB8IGJvb2xlYW4gfSA9IHt9O1xuICBASW5wdXQoKSBtdXN0Tm90RGlzcGxheWluZzogc3RyaW5nW10gPSBbXTtcbiAgQElucHV0KCkgd2lkdGggPSAnNTAwcHgnO1xuICBAT3V0cHV0KCkgb3BlbmVkID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuICBAT3V0cHV0KCkgY2xvc2VkID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuICBAVmlld0NoaWxkKFRlbXBsYXRlUmVmLCB7c3RhdGljOiB0cnVlfSkgdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmPGFueT47XG5cbiAgZGlhbG9nUmVmOiBNYXREaWFsb2dSZWY8YW55PjtcbiAgY29tcG9uZW50U3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb247XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBkaWFsb2c6IE1hdERpYWxvZyxcbiAgICAgICAgICAgICAgcHJpdmF0ZSB0dXRvcmlhbFNlcnZpY2U6IEJkY1dhbGtTZXJ2aWNlKSB7IH1cblxuICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gICAgdGhpcy5jb21wb25lbnRTdWJzY3JpcHRpb24gPSB0aGlzLnR1dG9yaWFsU2VydmljZS5jaGFuZ2VzLnN1YnNjcmliZSgoKSA9PiB0aGlzLl9zeW5jKCkpO1xuICB9XG5cbiAgbmdPbkNoYW5nZXMoKTogdm9pZCB7XG4gICAgdGhpcy5fc3luYygpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgaWYgKHRoaXMuY29tcG9uZW50U3Vic2NyaXB0aW9uKSB7XG4gICAgICB0aGlzLmNvbXBvbmVudFN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgIH1cblxuICAgIHRoaXMuX2Nsb3NlKCk7XG4gIH1cblxuICBnZXRWYWx1ZSh0YXNrTmFtZTogc3RyaW5nKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy50dXRvcmlhbFNlcnZpY2UuZ2V0VGFza0NvbXBsZXRlZCh0YXNrTmFtZSk7XG4gIH1cblxuICBjbG9zZShzZXRUYXNrczogeyBbdGFza05hbWU6IHN0cmluZ106IGFueSB8IGJvb2xlYW4gfSA9IHt9KSB7XG4gICAgdGhpcy50dXRvcmlhbFNlcnZpY2UubG9nVXNlckFjdGlvbih0aGlzLm5hbWUsIEJkY0Rpc3BsYXlFdmVudEFjdGlvbi5Vc2VyQ2xvc2VkKTtcbiAgICB0aGlzLnR1dG9yaWFsU2VydmljZS5zZXRUYXNrQ29tcGxldGVkKHRoaXMubmFtZSk7XG4gICAgdGhpcy50dXRvcmlhbFNlcnZpY2Uuc2V0VGFza3Moc2V0VGFza3MpO1xuICB9XG5cbiAgcHJpdmF0ZSBfb3BlbigpIHtcbiAgICB0aGlzLmRpYWxvZ1JlZiA9IHRoaXMuZGlhbG9nLm9wZW4odGhpcy50ZW1wbGF0ZVJlZiwge3dpZHRoOiB0aGlzLndpZHRoLCBkaXNhYmxlQ2xvc2U6IHRydWUsIHJlc3RvcmVGb2N1czogZmFsc2UsIHBhbmVsQ2xhc3M6ICdiZGMtd2Fsay1kaWFsb2cnfSk7XG4gICAgdGhpcy5vcGVuZWQuZW1pdCgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY2xvc2UoKSB7XG4gICAgaWYgKHRoaXMuZGlhbG9nUmVmKSB7XG4gICAgICB0aGlzLmRpYWxvZ1JlZi5jbG9zZSgpO1xuICAgICAgdGhpcy5kaWFsb2dSZWYgPSBudWxsO1xuICAgICAgdGhpcy5jbG9zZWQuZW1pdCgpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3N5bmMoKSB7XG4gICAgaWYgKHRoaXMubmFtZSkge1xuICAgICAgaWYgKCF0aGlzLnR1dG9yaWFsU2VydmljZS5nZXRUYXNrQ29tcGxldGVkKHRoaXMubmFtZSkgJiZcbiAgICAgICAgIXRoaXMudHV0b3JpYWxTZXJ2aWNlLmRpc2FibGVkICYmXG4gICAgICAgIHRoaXMudHV0b3JpYWxTZXJ2aWNlLmV2YWxNdXN0Q29tcGxldGVkKHRoaXMubXVzdENvbXBsZXRlZCkgJiZcbiAgICAgICAgdGhpcy50dXRvcmlhbFNlcnZpY2UuZXZhbE11c3ROb3REaXNwbGF5aW5nKHRoaXMubXVzdE5vdERpc3BsYXlpbmcpKSB7XG5cbiAgICAgICAgaWYgKCF0aGlzLmRpYWxvZ1JlZikge1xuICAgICAgICAgIHRoaXMuX29wZW4oKTtcbiAgICAgICAgICB0aGlzLnR1dG9yaWFsU2VydmljZS5zZXRJc0Rpc3BsYXlpbmcodGhpcy5uYW1lLCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0aGlzLmRpYWxvZ1JlZikge1xuICAgICAgICB0aGlzLl9jbG9zZSgpO1xuICAgICAgICB0aGlzLnR1dG9yaWFsU2VydmljZS5zZXRJc0Rpc3BsYXlpbmcodGhpcy5uYW1lLCBmYWxzZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iLCI8bmctdGVtcGxhdGU+XG4gIDxkaXYgY2xhc3M9XCJjb250YWluZXJcIj5cbiAgICA8bmctY29udGVudD48L25nLWNvbnRlbnQ+XG4gIDwvZGl2PlxuPC9uZy10ZW1wbGF0ZT5cbiJdfQ==
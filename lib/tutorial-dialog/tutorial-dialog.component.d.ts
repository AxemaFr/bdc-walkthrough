import { AfterContentInit, EventEmitter, OnChanges, OnDestroy, TemplateRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { BdcWalkService } from '../bdc-walk.service';
import * as i0 from "@angular/core";
export declare class BdcWalkDialogComponent implements AfterContentInit, OnDestroy, OnChanges {
    private dialog;
    private tutorialService;
    name: string;
    mustCompleted: {
        [taskName: string]: any | boolean;
    };
    mustNotDisplaying: string[];
    width: string;
    opened: EventEmitter<void>;
    closed: EventEmitter<void>;
    templateRef: TemplateRef<any>;
    dialogRef: MatDialogRef<any>;
    componentSubscription: Subscription;
    constructor(dialog: MatDialog, tutorialService: BdcWalkService);
    ngAfterContentInit(): void;
    ngOnChanges(): void;
    ngOnDestroy(): void;
    getValue(taskName: string): any;
    close(setTasks?: {
        [taskName: string]: any | boolean;
    }): void;
    private _open;
    private _close;
    private _sync;
    static ɵfac: i0.ɵɵFactoryDeclaration<BdcWalkDialogComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<BdcWalkDialogComponent, "bdc-walk-dialog", never, { "name": { "alias": "name"; "required": false; }; "mustCompleted": { "alias": "mustCompleted"; "required": false; }; "mustNotDisplaying": { "alias": "mustNotDisplaying"; "required": false; }; "width": { "alias": "width"; "required": false; }; }, { "opened": "opened"; "closed": "closed"; }, never, ["*"], false, never>;
}

import { EventEmitter, OnChanges, OnInit, TemplateRef } from '@angular/core';
import { MatMenu, MenuPositionX, MenuPositionY } from '@angular/material/menu';
import { BdcWalkService } from '../bdc-walk.service';
import { BdcWalkTriggerDirective } from './tutorial-trigger.directive';
import * as i0 from "@angular/core";
export declare class BdcWalkPopupComponent implements OnInit, OnChanges {
    private tutorialService;
    name: string;
    header: string;
    xPosition: MenuPositionX;
    yPosition: MenuPositionY;
    arrow: boolean;
    horizontal: boolean;
    closeOnClick: boolean;
    alignCenter: boolean | undefined;
    offsetX: number;
    offsetY: number;
    class: string;
    showCloseButton: boolean;
    showButton: boolean;
    buttonText: string;
    sideNoteText: string;
    mustCompleted: {
        [taskName: string]: any | boolean;
    };
    mustNotDisplaying: string[];
    onCloseCompleteTask: {
        [taskName: string]: any | boolean;
    };
    onButtonCompleteTask: {
        [taskName: string]: any | boolean;
    };
    opened: EventEmitter<void>;
    closed: EventEmitter<void>;
    className: any;
    menu: MatMenu;
    templateRef: TemplateRef<any>;
    trigger: BdcWalkTriggerDirective;
    data: any;
    constructor(tutorialService: BdcWalkService);
    ngOnInit(): void;
    ngOnChanges(): void;
    _getClass(): string;
    getValue(taskName: string): any;
    static ɵfac: i0.ɵɵFactoryDeclaration<BdcWalkPopupComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<BdcWalkPopupComponent, "bdc-walk-popup", never, { "name": { "alias": "name"; "required": false; }; "header": { "alias": "header"; "required": false; }; "xPosition": { "alias": "xPosition"; "required": false; }; "yPosition": { "alias": "yPosition"; "required": false; }; "arrow": { "alias": "arrow"; "required": false; }; "horizontal": { "alias": "horizontal"; "required": false; }; "closeOnClick": { "alias": "closeOnClick"; "required": false; }; "alignCenter": { "alias": "alignCenter"; "required": false; }; "offsetX": { "alias": "offsetX"; "required": false; }; "offsetY": { "alias": "offsetY"; "required": false; }; "class": { "alias": "class"; "required": false; }; "showCloseButton": { "alias": "showCloseButton"; "required": false; }; "showButton": { "alias": "showButton"; "required": false; }; "buttonText": { "alias": "buttonText"; "required": false; }; "sideNoteText": { "alias": "sideNoteText"; "required": false; }; "mustCompleted": { "alias": "mustCompleted"; "required": false; }; "mustNotDisplaying": { "alias": "mustNotDisplaying"; "required": false; }; "onCloseCompleteTask": { "alias": "onCloseCompleteTask"; "required": false; }; "onButtonCompleteTask": { "alias": "onButtonCompleteTask"; "required": false; }; }, { "opened": "opened"; "closed": "closed"; }, ["templateRef"], ["*"], false, never>;
}

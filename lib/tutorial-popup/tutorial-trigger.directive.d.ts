import { Direction, Directionality } from '@angular/cdk/bidi';
import { Overlay } from '@angular/cdk/overlay';
import { AfterContentChecked, AfterContentInit, ElementRef, NgZone, OnChanges, OnDestroy, ViewContainerRef } from '@angular/core';
import { BdcWalkPopupComponent } from './tutorial-popup.component';
import { BdcWalkService } from '../bdc-walk.service';
import * as i0 from "@angular/core";
export declare class BdcWalkTriggerDirective implements OnDestroy, OnChanges, AfterContentInit, AfterContentChecked {
    private tutorialService;
    private _overlay;
    private _element;
    private _viewContainerRef;
    private _dir;
    private _ngZone?;
    private _portal;
    private _overlayRef;
    private _menuOpen;
    private _closingActionsSubscription;
    private _hoverSubscription;
    private _menuCloseSubscription;
    private _scrollStrategy;
    private _componentSubscription;
    private _lastPosition;
    private _initialized;
    private _timer;
    private _contentInited;
    private _isTriggerVisible;
    enabled: boolean;
    mustCompleted: {
        [taskName: string]: any | boolean;
    };
    data: any;
    /** References the popup instance that the trigger is associated with. */
    get popup(): BdcWalkPopupComponent;
    set popup(popup: BdcWalkPopupComponent);
    private _menu;
    private _popup;
    constructor(tutorialService: BdcWalkService, _overlay: Overlay, _element: ElementRef<HTMLElement>, _viewContainerRef: ViewContainerRef, scrollStrategy: any, _dir: Directionality, _ngZone?: NgZone);
    ngAfterContentInit(): void;
    ngAfterContentChecked(): void;
    ngOnChanges(): void;
    ngOnDestroy(): void;
    /** Whether the menu is open. */
    get menuOpen(): boolean;
    /** The text direction of the containing app. */
    get dir(): Direction;
    /** Opens the menu. */
    openMenu(): void;
    /** Closes the menu. */
    closeMenu(): void;
    /**
     * Updates the position of the menu to ensure that it fits all options within the viewport.
     */
    updatePosition(): void;
    /** Closes the menu and does the necessary cleanup. */
    private _destroyMenu;
    /**
     * This method sets the menu state to open and focuses the first item if
     * the menu was opened via the keyboard.
     */
    private _initMenu;
    private _setIsMenuOpen;
    /**
     * This method creates the overlay from the provided menu's template and saves its
     * OverlayRef so that it can be attached to the DOM when openMenu is called.
     */
    private _createOverlay;
    /**
     * This method builds the configuration object needed to create the overlay, the OverlayState.
     * @returns OverlayConfig
     */
    private _getOverlayConfig;
    /**
     * Listens to changes in the position of the overlay and sets the correct classes
     * on the menu based on the new position. This ensures the animation origin is always
     * correct, even if a fallback position is used for the overlay.
     */
    private _subscribeToPositions;
    /**
     * Sets the appropriate positions on a position strategy
     * so the overlay connects with the trigger correctly.
     */
    private _setPosition;
    /** Returns a stream that emits whenever an action that should close the menu occurs. */
    private _menuClosingActions;
    /** Gets the portal that should be attached to the overlay. */
    private _getPortal;
    _click(): void;
    private _sync;
    reposition(): void;
    close(buttonClicked: boolean): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<BdcWalkTriggerDirective, [null, null, null, null, null, { optional: true; }, null]>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<BdcWalkTriggerDirective, "[bdcWalkTriggerFor]", never, { "enabled": { "alias": "enabled"; "required": false; }; "mustCompleted": { "alias": "mustCompleted"; "required": false; }; "data": { "alias": "data"; "required": false; }; "popup": { "alias": "bdcWalkTriggerFor"; "required": false; }; }, {}, never, never, false, never>;
}

import { OverlayConfig, } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Directive, HostListener, Inject, Input, Optional, } from '@angular/core';
import { merge, of as observableOf, Subscription } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';
import { MatMenu, MAT_MENU_SCROLL_STRATEGY } from '@angular/material/menu';
import { BdcDisplayEventAction } from '../bdc-walk.service';
import * as i0 from "@angular/core";
import * as i1 from "../bdc-walk.service";
import * as i2 from "@angular/cdk/overlay";
import * as i3 from "@angular/cdk/bidi";
export class BdcWalkTriggerDirective {
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
        const parentClose = observableOf();
        const hover = observableOf();
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: BdcWalkTriggerDirective, deps: [{ token: i1.BdcWalkService }, { token: i2.Overlay }, { token: i0.ElementRef }, { token: i0.ViewContainerRef }, { token: MAT_MENU_SCROLL_STRATEGY }, { token: i3.Directionality, optional: true }, { token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.8", type: BdcWalkTriggerDirective, selector: "[bdcWalkTriggerFor]", inputs: { enabled: "enabled", mustCompleted: "mustCompleted", data: "data", popup: ["bdcWalkTriggerFor", "popup"] }, host: { listeners: { "click": "_click()" } }, usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: BdcWalkTriggerDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[bdcWalkTriggerFor]'
                }]
        }], ctorParameters: () => [{ type: i1.BdcWalkService }, { type: i2.Overlay }, { type: i0.ElementRef }, { type: i0.ViewContainerRef }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_MENU_SCROLL_STRATEGY]
                }] }, { type: i3.Directionality, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHV0b3JpYWwtdHJpZ2dlci5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9iZGMtd2Fsa3Rocm91Z2gvc3JjL2xpYi90dXRvcmlhbC1wb3B1cC90dXRvcmlhbC10cmlnZ2VyLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBS0wsYUFBYSxHQUlkLE1BQU0sc0JBQXNCLENBQUM7QUFDOUIsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ25ELE9BQU8sRUFHTCxTQUFTLEVBRUssWUFBWSxFQUMxQixNQUFNLEVBRU4sS0FBSyxFQUdMLFFBQVEsR0FJVCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsS0FBSyxFQUFjLEVBQUUsSUFBSSxZQUFZLEVBQUUsWUFBWSxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ3pFLE9BQU8sRUFBUSxNQUFNLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQzlELE9BQU8sRUFBQyxPQUFPLEVBQUUsd0JBQXdCLEVBQTZDLE1BQU0sd0JBQXdCLENBQUM7QUFFckgsT0FBTyxFQUFDLHFCQUFxQixFQUFpQixNQUFNLHFCQUFxQixDQUFDOzs7OztBQUsxRSxNQUFNLE9BQU8sdUJBQXVCO0lBb0JsQyx5RUFBeUU7SUFDekUsSUFDSSxLQUFLO1FBQ1AsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQ3JCLENBQUM7SUFDRCxJQUFJLEtBQUssQ0FBQyxLQUE0QjtRQUNwQyxJQUFJLEtBQUssS0FBSyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDMUIsT0FBTztRQUNULENBQUM7UUFFRCxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUNwQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7UUFDeEIsSUFBSSxDQUFDLHNCQUFzQixDQUFD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LE9BQU87c0JBQWYsS0FBSztnQkFDRyxhQUFhO3NCQUFyQixLQUFLO2dCQUNHLElBQUk7c0JBQVosS0FBSztnQkFJRixLQUFLO3NCQURSLEtBQUs7dUJBQUMsbUJBQW1CO2dCQW1VMUIsTUFBTTtzQkFETCxZQUFZO3VCQUFDLE9BQU8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0RpcmVjdGlvbiwgRGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7XG4gIENvbm5lY3Rpb25Qb3NpdGlvblBhaXIsXG4gIEZsZXhpYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneSxcbiAgSG9yaXpvbnRhbENvbm5lY3Rpb25Qb3MsXG4gIE92ZXJsYXksXG4gIE92ZXJsYXlDb25maWcsXG4gIE92ZXJsYXlSZWYsXG4gIFNjcm9sbFN0cmF0ZWd5LFxuICBWZXJ0aWNhbENvbm5lY3Rpb25Qb3MsXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7VGVtcGxhdGVQb3J0YWx9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xuaW1wb3J0IHtcbiAgQWZ0ZXJDb250ZW50Q2hlY2tlZCxcbiAgQWZ0ZXJDb250ZW50SW5pdCxcbiAgRGlyZWN0aXZlLFxuICBFbGVtZW50UmVmLFxuICBFdmVudEVtaXR0ZXIsIEhvc3RMaXN0ZW5lcixcbiAgSW5qZWN0LFxuICBJbmplY3Rpb25Ub2tlbixcbiAgSW5wdXQsXG4gIE5nWm9uZSwgT25DaGFuZ2VzLFxuICBPbkRlc3Ryb3ksXG4gIE9wdGlvbmFsLFxuICBPdXRwdXQsXG4gIFNlbGYsXG4gIFZpZXdDb250YWluZXJSZWYsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHttZXJnZSwgT2JzZXJ2YWJsZSwgb2YgYXMgb2JzZXJ2YWJsZU9mLCBTdWJzY3JpcHRpb259IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtkZWxheSwgZmlsdGVyLCB0YWtlLCB0YWtlVW50aWx9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7TWF0TWVudSwgTUFUX01FTlVfU0NST0xMX1NUUkFURUdZLCBNYXRNZW51UGFuZWwsIE1lbnVQb3NpdGlvblgsIE1lbnVQb3NpdGlvbll9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL21lbnUnO1xuaW1wb3J0IHtCZGNXYWxrUG9wdXBDb21wb25lbnR9IGZyb20gJy4vdHV0b3JpYWwtcG9wdXAuY29tcG9uZW50JztcbmltcG9ydCB7QmRjRGlzcGxheUV2ZW50QWN0aW9uLCBCZGNXYWxrU2VydmljZX0gZnJvbSAnLi4vYmRjLXdhbGsuc2VydmljZSc7XG5cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tiZGNXYWxrVHJpZ2dlckZvcl0nXG59KVxuZXhwb3J0IGNsYXNzIEJkY1dhbGtUcmlnZ2VyRGlyZWN0aXZlIGltcGxlbWVudHMgT25EZXN0cm95LCBPbkNoYW5nZXMsIEFmdGVyQ29udGVudEluaXQsIEFmdGVyQ29udGVudENoZWNrZWQge1xuICBwcml2YXRlIF9wb3J0YWw6IFRlbXBsYXRlUG9ydGFsO1xuICBwcml2YXRlIF9vdmVybGF5UmVmOiBPdmVybGF5UmVmIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX21lbnVPcGVuID0gZmFsc2U7XG4gIHByaXZhdGUgX2Nsb3NpbmdBY3Rpb25zU3Vic2NyaXB0aW9uID0gU3Vic2NyaXB0aW9uLkVNUFRZO1xuICBwcml2YXRlIF9ob3ZlclN1YnNjcmlwdGlvbiA9IFN1YnNjcmlwdGlvbi5FTVBUWTtcbiAgcHJpdmF0ZSBfbWVudUNsb3NlU3Vic2NyaXB0aW9uID0gU3Vic2NyaXB0aW9uLkVNUFRZO1xuICBwcml2YXRlIF9zY3JvbGxTdHJhdGVneTogKCkgPT4gU2Nyb2xsU3RyYXRlZ3k7XG5cbiAgcHJpdmF0ZSBfY29tcG9uZW50U3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb247XG4gIHByaXZhdGUgX2xhc3RQb3NpdGlvbjogQ29ubmVjdGlvblBvc2l0aW9uUGFpcjtcbiAgcHJpdmF0ZSBfaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgcHJpdmF0ZSBfdGltZXI6IGFueTtcbiAgcHJpdmF0ZSBfY29udGVudEluaXRlZCA9IGZhbHNlO1xuICBwcml2YXRlIF9pc1RyaWdnZXJWaXNpYmxlID0gdHJ1ZTtcblxuICBASW5wdXQoKSBlbmFibGVkID0gdHJ1ZTtcbiAgQElucHV0KCkgbXVzdENvbXBsZXRlZDogeyBbdGFza05hbWU6IHN0cmluZ106IGFueSB8IGJvb2xlYW4gfSA9IHt9O1xuICBASW5wdXQoKSBkYXRhOiBhbnk7XG5cbiAgLyoqIFJlZmVyZW5jZXMgdGhlIHBvcHVwIGluc3RhbmNlIHRoYXQgdGhlIHRyaWdnZXIgaXMgYXNzb2NpYXRlZCB3aXRoLiAqL1xuICBASW5wdXQoJ2JkY1dhbGtUcmlnZ2VyRm9yJylcbiAgZ2V0IHBvcHVwKCk6IEJkY1dhbGtQb3B1cENvbXBvbmVudCB7XG4gICAgcmV0dXJuIHRoaXMuX3BvcHVwO1xuICB9XG4gIHNldCBwb3B1cChwb3B1cDogQmRjV2Fsa1BvcHVwQ29tcG9uZW50KSB7XG4gICAgaWYgKHBvcHVwID09PSB0aGlzLl9wb3B1cCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX3BvcHVwID0gcG9wdXA7XG4gICAgdGhpcy5fbWVudSA9IHBvcHVwLm1lbnU7XG4gICAgdGhpcy5fbWVudUNsb3NlU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG5cbiAgICBpZiAocG9wdXApIHtcbiAgICAgIHRoaXMuX21lbnVDbG9zZVN1YnNjcmlwdGlvbiA9IHBvcHVwLm1lbnUuY2xvc2VkLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIHRoaXMuX2Rlc3Ryb3lNZW51KCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9tZW51OiBNYXRNZW51UGFuZWwgfCBudWxsO1xuICBwcml2YXRlIF9wb3B1cDogQmRjV2Fsa1BvcHVwQ29tcG9uZW50O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgdHV0b3JpYWxTZXJ2aWNlOiBCZGNXYWxrU2VydmljZSxcbiAgICBwcml2YXRlIF9vdmVybGF5OiBPdmVybGF5LFxuICAgIHByaXZhdGUgX2VsZW1lbnQ6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgIHByaXZhdGUgX3ZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsXG4gICAgQEluamVjdChNQVRfTUVOVV9TQ1JPTExfU1RSQVRFR1kpIHNjcm9sbFN0cmF0ZWd5OiBhbnksXG4gICAgQE9wdGlvbmFsKCkgcHJpdmF0ZSBfZGlyOiBEaXJlY3Rpb25hbGl0eSxcbiAgICBwcml2YXRlIF9uZ1pvbmU/OiBOZ1pvbmUsXG4gICkge1xuICAgIHRoaXMuX3Njcm9sbFN0cmF0ZWd5ID0gc2Nyb2xsU3RyYXRlZ3k7XG4gIH1cblxuICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gICAgdGhpcy5fY29udGVudEluaXRlZCA9IHRydWU7XG4gICAgdGhpcy5fY29tcG9uZW50U3Vic2NyaXB0aW9uID0gdGhpcy50dXRvcmlhbFNlcnZpY2UuY2hhbmdlcy5zdWJzY3JpYmUoKCkgPT4gdGhpcy5fc3luYygpKTtcbiAgfVxuXG4gIG5nQWZ0ZXJDb250ZW50Q2hlY2tlZCgpIHtcbiAgICAvLyBkZXRlY3QgY2hhbmdlcyBpZiB0cmlnZ2VyIHZpc2liaWxpdHkgY2hhbmdlZFxuICAgIGNvbnN0IGlzVHJpZ2dlclZpc2libGUgPSAhIXRoaXMuX2VsZW1lbnQubmF0aXZlRWxlbWVudC5vZmZzZXRQYXJlbnQ7XG5cbiAgICBpZiAoaXNUcmlnZ2VyVmlzaWJsZSAhPT0gdGhpcy5faXNUcmlnZ2VyVmlzaWJsZSAmJiB0aGlzLl9jb250ZW50SW5pdGVkKSB7XG4gICAgICB0aGlzLl9pc1RyaWdnZXJWaXNpYmxlID0gaXNUcmlnZ2VyVmlzaWJsZTtcbiAgICAgIHRoaXMuX3N5bmMoKTtcbiAgICB9XG4gIH1cblxuICBuZ09uQ2hhbmdlcygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fY29udGVudEluaXRlZCkge1xuICAgICAgdGhpcy5fc3luYygpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIGlmICh0aGlzLl9jb21wb25lbnRTdWJzY3JpcHRpb24pIHtcbiAgICAgIHRoaXMuX2NvbXBvbmVudFN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgIH1cblxuICAgIC8vIG11c3QgZGlzYWJsZSBhdXRvLWluaXQgYW5kIHJlbGVhc2UgcG9wdXAgc28gb3RoZXJzIG1heSB1c2UgaXRcbiAgICBjbGVhclRpbWVvdXQodGhpcy5fdGltZXIpO1xuXG4gICAgaWYgKHRoaXMuX2luaXRpYWxpemVkKSB7XG4gICAgICB0aGlzLnBvcHVwLnRyaWdnZXIgPSBudWxsO1xuICAgICAgdGhpcy5wb3B1cC5kYXRhID0gbnVsbDtcbiAgICAgIHRoaXMudHV0b3JpYWxTZXJ2aWNlLnNldElzRGlzcGxheWluZyh0aGlzLnBvcHVwLm5hbWUsIGZhbHNlKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fb3ZlcmxheVJlZikge1xuICAgICAgdGhpcy5fb3ZlcmxheVJlZi5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9vdmVybGF5UmVmID0gbnVsbDtcbiAgICB9XG5cbiAgICB0aGlzLl9tZW51Q2xvc2VTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICB0aGlzLl9jbG9zaW5nQWN0aW9uc1N1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgIHRoaXMuX2hvdmVyU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgbWVudSBpcyBvcGVuLiAqL1xuICBnZXQgbWVudU9wZW4oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX21lbnVPcGVuO1xuICB9XG5cbiAgLyoqIFRoZSB0ZXh0IGRpcmVjdGlvbiBvZiB0aGUgY29udGFpbmluZyBhcHAuICovXG4gIGdldCBkaXIoKTogRGlyZWN0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5fZGlyICYmIHRoaXMuX2Rpci52YWx1ZSA9PT0gJ3J0bCcgPyAncnRsJyA6ICdsdHInO1xuICB9XG5cbiAgLyoqIE9wZW5zIHRoZSBtZW51LiAqL1xuICBvcGVuTWVudSgpOiB2b2lkIHtcbiAgICBjb25zdCBtZW51ID0gdGhpcy5fbWVudTtcblxuICAgIGlmICh0aGlzLl9tZW51T3BlbiB8fCAhbWVudSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG92ZXJsYXlSZWYgPSB0aGlzLl9jcmVhdGVPdmVybGF5KG1lbnUpO1xuICAgIGNvbnN0IG92ZXJsYXlDb25maWcgPSBvdmVybGF5UmVmLmdldENvbmZpZygpO1xuICAgIGNvbnN0IHBvc2l0aW9uU3RyYXRlZ3kgPSBvdmVybGF5Q29uZmlnLnBvc2l0aW9uU3RyYXRlZ3kgYXMgRmxleGlibGVDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5O1xuXG4gICAgdGhpcy5fc2V0UG9zaXRpb24obWVudSwgcG9zaXRpb25TdHJhdGVneSk7XG4gICAgb3ZlcmxheUNvbmZpZy5oYXNCYWNrZHJvcCA9IG1lbnUuaGFzQmFja2Ryb3A7XG4gICAgb3ZlcmxheVJlZi5hdHRhY2godGhpcy5fZ2V0UG9ydGFsKG1lbnUpKTtcblxuICAgIGlmIChtZW51LmxhenlDb250ZW50KSB7XG4gICAgICBtZW51LmxhenlDb250ZW50LmF0dGFjaCgpO1xuICAgIH1cblxuICAgIHRoaXMuX2Nsb3NpbmdBY3Rpb25zU3Vic2NyaXB0aW9uID0gdGhpcy5fbWVudUNsb3NpbmdBY3Rpb25zKCkuc3Vic2NyaWJlKCgpID0+IHRoaXMuY2xvc2VNZW51KCkpO1xuICAgIHRoaXMuX2luaXRNZW51KG1lbnUpO1xuXG4gICAgaWYgKG1lbnUgaW5zdGFuY2VvZiBNYXRNZW51KSB7XG4gICAgICBtZW51Ll9zdGFydEFuaW1hdGlvbigpO1xuICAgICAgbWVudS5fZGlyZWN0RGVzY2VuZGFudEl0ZW1zLmNoYW5nZXMucGlwZSh0YWtlVW50aWwobWVudS5jbG9zZSkpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIC8vIFJlLWFkanVzdCB0aGUgcG9zaXRpb24gd2l0aG91dCBsb2NraW5nIHdoZW4gdGhlIGFtb3VudCBvZiBpdGVtc1xuICAgICAgICAvLyBjaGFuZ2VzIHNvIHRoYXQgdGhlIG92ZXJsYXkgaXMgYWxsb3dlZCB0byBwaWNrIGEgbmV3IG9wdGltYWwgcG9zaXRpb24uXG4gICAgICAgIHBvc2l0aW9uU3RyYXRlZ3kud2l0aExvY2tlZFBvc2l0aW9uKGZhbHNlKS5yZWFwcGx5TGFzdFBvc2l0aW9uKCk7XG4gICAgICAgIHBvc2l0aW9uU3RyYXRlZ3kud2l0aExvY2tlZFBvc2l0aW9uKHRydWUpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIENsb3NlcyB0aGUgbWVudS4gKi9cbiAgY2xvc2VNZW51KCk6IHZvaWQge1xuICAgIHRoaXMuX21lbnU/LmNsb3NlLmVtaXQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBwb3NpdGlvbiBvZiB0aGUgbWVudSB0byBlbnN1cmUgdGhhdCBpdCBmaXRzIGFsbCBvcHRpb25zIHdpdGhpbiB0aGUgdmlld3BvcnQuXG4gICAqL1xuICB1cGRhdGVQb3NpdGlvbigpOiB2b2lkIHtcbiAgICB0aGlzLl9vdmVybGF5UmVmPy51cGRhdGVQb3NpdGlvbigpO1xuICB9XG5cbiAgLyoqIENsb3NlcyB0aGUgbWVudSBhbmQgZG9lcyB0aGUgbmVjZXNzYXJ5IGNsZWFudXAuICovXG4gIHByaXZhdGUgX2Rlc3Ryb3lNZW51KCkge1xuICAgIGlmICghdGhpcy5fb3ZlcmxheVJlZiB8fCAhdGhpcy5tZW51T3Blbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG1lbnUgPSB0aGlzLl9tZW51O1xuICAgIHRoaXMuX2Nsb3NpbmdBY3Rpb25zU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5fb3ZlcmxheVJlZi5kZXRhY2goKTtcblxuICAgIGlmIChtZW51IGluc3RhbmNlb2YgTWF0TWVudSkge1xuICAgICAgbWVudS5fcmVzZXRBbmltYXRpb24oKTtcblxuICAgICAgaWYgKG1lbnUubGF6eUNvbnRlbnQpIHtcbiAgICAgICAgLy8gV2FpdCBmb3IgdGhlIGV4aXQgYW5pbWF0aW9uIHRvIGZpbmlzaCBiZWZvcmUgZGV0YWNoaW5nIHRoZSBjb250ZW50LlxuICAgICAgICBtZW51Ll9hbmltYXRpb25Eb25lXG4gICAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICBmaWx0ZXIoZXZlbnQgPT4gZXZlbnQudG9TdGF0ZSA9PT0gJ3ZvaWQnKSxcbiAgICAgICAgICAgIHRha2UoMSksXG4gICAgICAgICAgICAvLyBJbnRlcnJ1cHQgaWYgdGhlIGNvbnRlbnQgZ290IHJlLWF0dGFjaGVkLlxuICAgICAgICAgICAgdGFrZVVudGlsKG1lbnUubGF6eUNvbnRlbnQuX2F0dGFjaGVkKSxcbiAgICAgICAgICApXG4gICAgICAgICAgLnN1YnNjcmliZSh7XG4gICAgICAgICAgICBuZXh0OiAoKSA9PiBtZW51LmxhenlDb250ZW50IS5kZXRhY2goKSxcbiAgICAgICAgICAgIC8vIE5vIG1hdHRlciB3aGV0aGVyIHRoZSBjb250ZW50IGdvdCByZS1hdHRhY2hlZCwgcmVzZXQgdGhlIG1lbnUuXG4gICAgICAgICAgICBjb21wbGV0ZTogKCkgPT4gdGhpcy5fc2V0SXNNZW51T3BlbihmYWxzZSksXG4gICAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9zZXRJc01lbnVPcGVuKGZhbHNlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fc2V0SXNNZW51T3BlbihmYWxzZSk7XG4gICAgICBtZW51Py5sYXp5Q29udGVudD8uZGV0YWNoKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgbWV0aG9kIHNldHMgdGhlIG1lbnUgc3RhdGUgdG8gb3BlbiBhbmQgZm9jdXNlcyB0aGUgZmlyc3QgaXRlbSBpZlxuICAgKiB0aGUgbWVudSB3YXMgb3BlbmVkIHZpYSB0aGUga2V5Ym9hcmQuXG4gICAqL1xuICBwcml2YXRlIF9pbml0TWVudShtZW51OiBNYXRNZW51UGFuZWwpOiB2b2lkIHtcbiAgICBtZW51LmRpcmVjdGlvbiA9IHRoaXMuZGlyO1xuICAgIHRoaXMuX3NldElzTWVudU9wZW4odHJ1ZSk7XG4gIH1cblxuICAvLyBzZXQgc3RhdGUgcmF0aGVyIHRoYW4gdG9nZ2xlIHRvIHN1cHBvcnQgdHJpZ2dlcnMgc2hhcmluZyBhIG1lbnVcbiAgcHJpdmF0ZSBfc2V0SXNNZW51T3Blbihpc09wZW46IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl9tZW51T3BlbiA9IGlzT3BlbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCBjcmVhdGVzIHRoZSBvdmVybGF5IGZyb20gdGhlIHByb3ZpZGVkIG1lbnUncyB0ZW1wbGF0ZSBhbmQgc2F2ZXMgaXRzXG4gICAqIE92ZXJsYXlSZWYgc28gdGhhdCBpdCBjYW4gYmUgYXR0YWNoZWQgdG8gdGhlIERPTSB3aGVuIG9wZW5NZW51IGlzIGNhbGxlZC5cbiAgICovXG4gIHByaXZhdGUgX2NyZWF0ZU92ZXJsYXkobWVudTogTWF0TWVudVBhbmVsKTogT3ZlcmxheVJlZiB7XG4gICAgaWYgKCF0aGlzLl9vdmVybGF5UmVmKSB7XG4gICAgICBjb25zdCBjb25maWcgPSB0aGlzLl9nZXRPdmVybGF5Q29uZmlnKG1lbnUpO1xuICAgICAgdGhpcy5fc3Vic2NyaWJlVG9Qb3NpdGlvbnMoXG4gICAgICAgIG1lbnUsXG4gICAgICAgIGNvbmZpZy5wb3NpdGlvblN0cmF0ZWd5IGFzIEZsZXhpYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneSxcbiAgICAgICk7XG4gICAgICB0aGlzLl9vdmVybGF5UmVmID0gdGhpcy5fb3ZlcmxheS5jcmVhdGUoY29uZmlnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fb3ZlcmxheVJlZjtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCBidWlsZHMgdGhlIGNvbmZpZ3VyYXRpb24gb2JqZWN0IG5lZWRlZCB0byBjcmVhdGUgdGhlIG92ZXJsYXksIHRoZSBPdmVybGF5U3RhdGUuXG4gICAqIEByZXR1cm5zIE92ZXJsYXlDb25maWdcbiAgICovXG4gIHByaXZhdGUgX2dldE92ZXJsYXlDb25maWcobWVudTogTWF0TWVudVBhbmVsKTogT3ZlcmxheUNvbmZpZyB7XG4gICAgLy8gb3ZlcnJpZGUgb3ZlcmxheSB0byBhdm9pZCByZXNpemluZyBvZiBwb3B1cHNcbiAgICBjb25zdCBwb3NpdGlvblN0cmF0ZWd5ID0gdGhpcy5fb3ZlcmxheS5wb3NpdGlvbigpXG4gICAgICAuZmxleGlibGVDb25uZWN0ZWRUbyh0aGlzLl9lbGVtZW50KVxuICAgICAgLndpdGhQdXNoKHRydWUpXG4gICAgICAud2l0aEZsZXhpYmxlRGltZW5zaW9ucyhmYWxzZSlcbiAgICAgIC53aXRoVHJhbnNmb3JtT3JpZ2luT24oJy5tYXQtbWVudS1wYW5lbCwgLm1hdC1tZGMtbWVudS1wYW5lbCcpO1xuXG4gICAgLy8gcGF0Y2ggcG9zaXRpb25TdHJhdGVneSB0byBkaXNhYmxlIHB1c2ggZm9yIFkgYXhpc1xuICAgIGNvbnN0IGN1ckdldEV4YWN0T3ZlcmxheVkgPSBwb3NpdGlvblN0cmF0ZWd5WydfZ2V0RXhhY3RPdmVybGF5WSddO1xuXG4gICAgcG9zaXRpb25TdHJhdGVneVsnX2dldEV4YWN0T3ZlcmxheVknXSA9ICguLi5hcmdzKSA9PiB7XG4gICAgICBjb25zdCBjdXJJc1B1c2hlZCA9IHBvc2l0aW9uU3RyYXRlZ3lbJ19pc1B1c2hlZCddO1xuICAgICAgcG9zaXRpb25TdHJhdGVneVsnX2lzUHVzaGVkJ10gPSBmYWxzZTtcbiAgICAgIGNvbnN0IHZhbHVlID0gY3VyR2V0RXhhY3RPdmVybGF5WS5jYWxsKHBvc2l0aW9uU3RyYXRlZ3ksIC4uLmFyZ3MpO1xuICAgICAgcG9zaXRpb25TdHJhdGVneVsnX2lzUHVzaGVkJ10gPSBjdXJJc1B1c2hlZDtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIG5ldyBPdmVybGF5Q29uZmlnKHtcbiAgICAgIHBvc2l0aW9uU3RyYXRlZ3ksXG4gICAgICBzY3JvbGxTdHJhdGVneTogdGhpcy5fc2Nyb2xsU3RyYXRlZ3koKSxcbiAgICAgIGRpcmVjdGlvbjogdGhpcy5fZGlyXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogTGlzdGVucyB0byBjaGFuZ2VzIGluIHRoZSBwb3NpdGlvbiBvZiB0aGUgb3ZlcmxheSBhbmQgc2V0cyB0aGUgY29ycmVjdCBjbGFzc2VzXG4gICAqIG9uIHRoZSBtZW51IGJhc2VkIG9uIHRoZSBuZXcgcG9zaXRpb24uIFRoaXMgZW5zdXJlcyB0aGUgYW5pbWF0aW9uIG9yaWdpbiBpcyBhbHdheXNcbiAgICogY29ycmVjdCwgZXZlbiBpZiBhIGZhbGxiYWNrIHBvc2l0aW9uIGlzIHVzZWQgZm9yIHRoZSBvdmVybGF5LlxuICAgKi9cbiAgcHJpdmF0ZSBfc3Vic2NyaWJlVG9Qb3NpdGlvbnMobWVudTogTWF0TWVudVBhbmVsLCBwb3NpdGlvbjogRmxleGlibGVDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5KSB7XG4gICAgaWYgKG1lbnUuc2V0UG9zaXRpb25DbGFzc2VzKSB7XG4gICAgICBwb3NpdGlvbi5wb3NpdGlvbkNoYW5nZXMuc3Vic2NyaWJlKGNoYW5nZSA9PiB7XG4gICAgICAgIGNvbnN0IHBvc1g6IE1lbnVQb3NpdGlvblggPSBjaGFuZ2UuY29ubmVjdGlvblBhaXIub3ZlcmxheVggPT09ICdzdGFydCcgPyAnYWZ0ZXInIDogJ2JlZm9yZSc7XG4gICAgICAgIGNvbnN0IHBvc1k6IE1lbnVQb3NpdGlvblkgPSBjaGFuZ2UuY29ubmVjdGlvblBhaXIub3ZlcmxheVkgPT09ICd0b3AnID8gJ2JlbG93JyA6ICdhYm92ZSc7XG5cbiAgICAgICAgaWYgKCF0aGlzLl9sYXN0UG9zaXRpb24gfHwgdGhpcy5fbGFzdFBvc2l0aW9uLm9yaWdpblggIT09IGNoYW5nZS5jb25uZWN0aW9uUGFpci5vcmlnaW5YIHx8XG4gICAgICAgICAgdGhpcy5fbGFzdFBvc2l0aW9uLm9yaWdpblkgIT09IGNoYW5nZS5jb25uZWN0aW9uUGFpci5vcmlnaW5ZKSB7XG4gICAgICAgICAgLy8gc2VsZWN0ZWQgcG9zaXRpb24gY2hhbmdlZCwgd2UgbXVzdCBydW4gZGV0ZWN0IGNoYW5nZXMgdG8gdXBkYXRlIGFycm93IGNzc1xuICAgICAgICAgIHRoaXMuX2xhc3RQb3NpdGlvbiA9IGNoYW5nZS5jb25uZWN0aW9uUGFpcjtcbiAgICAgICAgICAvLyB0aGlzLl9uZ1pvbmUucnVuKCgpID0+IHNldFRpbWVvdXQoKCkgPT4ge30pKTtcbiAgICAgICAgICB0aGlzLl9uZ1pvbmUucnVuKCgpID0+IG1lbnUuc2V0UG9zaXRpb25DbGFzc2VzKHBvc1gsIHBvc1kpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGFwcHJvcHJpYXRlIHBvc2l0aW9ucyBvbiBhIHBvc2l0aW9uIHN0cmF0ZWd5XG4gICAqIHNvIHRoZSBvdmVybGF5IGNvbm5lY3RzIHdpdGggdGhlIHRyaWdnZXIgY29ycmVjdGx5LlxuICAgKi9cbiAgcHJpdmF0ZSBfc2V0UG9zaXRpb24obWVudTogTWF0TWVudVBhbmVsLCBwb3NpdGlvblN0cmF0ZWd5OiBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3kpIHtcbiAgICAvLyBvdmVycmlkZSBwb3NpdGlvbiBzdHJhdGVneSB0byBzdXBwb3J0IG9wZW4gdG8gdGhlIHNpZGVzXG4gICAgbGV0IFtvcmlnaW5YLCBvcmlnaW5GYWxsYmFja1hdOiBIb3Jpem9udGFsQ29ubmVjdGlvblBvc1tdID1cbiAgICAgIG1lbnUueFBvc2l0aW9uID09PSAnYmVmb3JlJyA/IFsnZW5kJywgJ3N0YXJ0J10gOiBbJ3N0YXJ0JywgJ2VuZCddO1xuXG4gICAgY29uc3QgW292ZXJsYXlZLCBvdmVybGF5RmFsbGJhY2tZXTogVmVydGljYWxDb25uZWN0aW9uUG9zW10gPVxuICAgICAgbWVudS55UG9zaXRpb24gPT09ICdhYm92ZScgPyBbJ2JvdHRvbScsICd0b3AnXSA6IFsndG9wJywgJ2JvdHRvbSddO1xuXG4gICAgbGV0IFtvcmlnaW5ZLCBvcmlnaW5GYWxsYmFja1ldID0gW292ZXJsYXlZLCBvdmVybGF5RmFsbGJhY2tZXTtcbiAgICBsZXQgW292ZXJsYXlYLCBvdmVybGF5RmFsbGJhY2tYXSA9IFtvcmlnaW5YLCBvcmlnaW5GYWxsYmFja1hdO1xuXG4gICAgLy8gYWxpZ24gcG9wdXAncyBhcnJvdyB0byBjZW50ZXIgb2YgYXR0YWNoZWQgZWxlbWVudCBpZiBlbGVtZW50IHNpemUgPCA3MFxuICAgIGNvbnN0IG9mZnNldFggPSB0aGlzLnBvcHVwLm9mZnNldFggfHwgKCh0aGlzLnBvcHVwLmFsaWduQ2VudGVyIHx8ICh0aGlzLl9lbGVtZW50Lm5hdGl2ZUVsZW1lbnQub2Zmc2V0V2lkdGggPCAxMzAgJiZcbiAgICAgIHRoaXMucG9wdXAuYWxpZ25DZW50ZXIgPT09IHVuZGVmaW5lZCkpICYmICF0aGlzLnBvcHVwLmhvcml6b250YWwgPyAodGhpcy5fZWxlbWVudC5uYXRpdmVFbGVtZW50Lm9mZnNldFdpZHRoIC8gLTIgKyAyOSkgKlxuICAgICAgKG1lbnUueFBvc2l0aW9uID09PSAnYmVmb3JlJyA/IDEgOiAtMSkgOiAwKTtcblxuICAgIGNvbnN0IG9mZnNldFkgPSB0aGlzLnBvcHVwLm9mZnNldFkgfHwgKCh0aGlzLnBvcHVwLmFsaWduQ2VudGVyIHx8ICh0aGlzLl9lbGVtZW50Lm5hdGl2ZUVsZW1lbnQub2Zmc2V0SGVpZ2h0IDwgODAgJiZcbiAgICAgIHRoaXMucG9wdXAuYWxpZ25DZW50ZXIgPT09IHVuZGVmaW5lZCkpICYmIHRoaXMucG9wdXAuaG9yaXpvbnRhbCA/ICh0aGlzLl9lbGVtZW50Lm5hdGl2ZUVsZW1lbnQub2Zmc2V0SGVpZ2h0IC8gMiAtIDI5KSAqXG4gICAgICAobWVudS55UG9zaXRpb24gPT09ICdiZWxvdycgPyAxIDogLTEpIDogMCk7XG5cbiAgICBpZiAodGhpcy5wb3B1cC5ob3Jpem9udGFsKSB7XG4gICAgICAvLyBXaGVuIHRoZSBtZW51IGlzIGEgc3ViLW1lbnUsIGl0IHNob3VsZCBhbHdheXMgYWxpZ24gaXRzZWxmXG4gICAgICAvLyB0byB0aGUgZWRnZXMgb2YgdGhlIHRyaWdnZXIsIGluc3RlYWQgb2Ygb3ZlcmxhcHBpbmcgaXQuXG4gICAgICBvdmVybGF5RmFsbGJhY2tYID0gb3JpZ2luWCA9IG1lbnUueFBvc2l0aW9uID09PSAnYmVmb3JlJyA/ICdzdGFydCcgOiAnZW5kJztcbiAgICAgIG9yaWdpbkZhbGxiYWNrWCA9IG92ZXJsYXlYID0gb3JpZ2luWCA9PT0gJ2VuZCcgPyAnc3RhcnQnIDogJ2VuZCc7XG4gICAgfSBlbHNlIGlmICghbWVudS5vdmVybGFwVHJpZ2dlcikge1xuICAgICAgb3JpZ2luWSA9IG92ZXJsYXlZID09PSAndG9wJyA/ICdib3R0b20nIDogJ3RvcCc7XG4gICAgICBvcmlnaW5GYWxsYmFja1kgPSBvdmVybGF5RmFsbGJhY2tZID09PSAndG9wJyA/ICdib3R0b20nIDogJ3RvcCc7XG4gICAgfVxuXG4gICAgY29uc3Qgb3JpZ2luYWwgPSB7b3JpZ2luWCwgb3JpZ2luWSwgb3ZlcmxheVgsIG92ZXJsYXlZLCBvZmZzZXRYLCBvZmZzZXRZfTtcbiAgICBjb25zdCBmbGlwWCA9IHtvcmlnaW5YOiBvcmlnaW5GYWxsYmFja1gsIG9yaWdpblksIG92ZXJsYXlYOiBvdmVybGF5RmFsbGJhY2tYLCBvdmVybGF5WSwgb2Zmc2V0WDogLW9mZnNldFgsIG9mZnNldFl9O1xuICAgIGNvbnN0IGZsaXBZID0ge29yaWdpblgsIG9yaWdpblk6IG9yaWdpbkZhbGxiYWNrWSwgb3ZlcmxheVgsIG92ZXJsYXlZOiBvdmVybGF5RmFsbGJhY2tZLCBvZmZzZXRYLCBvZmZzZXRZOiAtb2Zmc2V0WX07XG4gICAgY29uc3QgZmxpcFhZID0ge29yaWdpblg6IG9yaWdpbkZhbGxiYWNrWCwgb3JpZ2luWTogb3JpZ2luRmFsbGJhY2tZLCBvdmVybGF5WDogb3ZlcmxheUZhbGxiYWNrWCwgb3ZlcmxheVk6IG92ZXJsYXlGYWxsYmFja1ksXG4gICAgICBvZmZzZXRYOiAtb2Zmc2V0WCwgb2Zmc2V0WTogLW9mZnNldFl9O1xuXG4gICAgcG9zaXRpb25TdHJhdGVneS53aXRoUG9zaXRpb25zKHRoaXMucG9wdXAuaG9yaXpvbnRhbCA/IFtvcmlnaW5hbCwgZmxpcFhdIDogW29yaWdpbmFsLCBmbGlwWSwgZmxpcFhZXSk7XG4gIH1cblxuICAvKiogUmV0dXJucyBhIHN0cmVhbSB0aGF0IGVtaXRzIHdoZW5ldmVyIGFuIGFjdGlvbiB0aGF0IHNob3VsZCBjbG9zZSB0aGUgbWVudSBvY2N1cnMuICovXG4gIHByaXZhdGUgX21lbnVDbG9zaW5nQWN0aW9ucygpIHtcbiAgICBjb25zdCBiYWNrZHJvcCA9IHRoaXMuX292ZXJsYXlSZWYhLmJhY2tkcm9wQ2xpY2soKTtcbiAgICBjb25zdCBkZXRhY2htZW50cyA9IHRoaXMuX292ZXJsYXlSZWYhLmRldGFjaG1lbnRzKCk7XG4gICAgY29uc3QgcGFyZW50Q2xvc2UgPSBvYnNlcnZhYmxlT2YoKTtcbiAgICBjb25zdCBob3ZlciA9IG9ic2VydmFibGVPZigpO1xuXG4gICAgcmV0dXJuIG1lcmdlKGJhY2tkcm9wLCBwYXJlbnRDbG9zZSBhcyBPYnNlcnZhYmxlPHZvaWQ+LCBob3ZlciwgZGV0YWNobWVudHMpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHBvcnRhbCB0aGF0IHNob3VsZCBiZSBhdHRhY2hlZCB0byB0aGUgb3ZlcmxheS4gKi9cbiAgcHJpdmF0ZSBfZ2V0UG9ydGFsKG1lbnU6IE1hdE1lbnVQYW5lbCk6IFRlbXBsYXRlUG9ydGFsIHtcbiAgICAvLyBOb3RlIHRoYXQgd2UgY2FuIGF2b2lkIHRoaXMgY2hlY2sgYnkga2VlcGluZyB0aGUgcG9ydGFsIG9uIHRoZSBtZW51IHBhbmVsLlxuICAgIC8vIFdoaWxlIGl0IHdvdWxkIGJlIGNsZWFuZXIsIHdlJ2QgaGF2ZSB0byBpbnRyb2R1Y2UgYW5vdGhlciByZXF1aXJlZCBtZXRob2Qgb25cbiAgICAvLyBgTWF0TWVudVBhbmVsYCwgbWFraW5nIGl0IGhhcmRlciB0byBjb25zdW1lLlxuICAgIGlmICghdGhpcy5fcG9ydGFsIHx8IHRoaXMuX3BvcnRhbC50ZW1wbGF0ZVJlZiAhPT0gbWVudS50ZW1wbGF0ZVJlZikge1xuICAgICAgdGhpcy5fcG9ydGFsID0gbmV3IFRlbXBsYXRlUG9ydGFsKG1lbnUudGVtcGxhdGVSZWYsIHRoaXMuX3ZpZXdDb250YWluZXJSZWYpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9wb3J0YWw7XG4gIH1cblxuICAvLy8gY3VzdG9tIGNvZGVcblxuICBASG9zdExpc3RlbmVyKCdjbGljaycpXG4gIF9jbGljaygpIHtcbiAgICAvLyBlbGVtZW50IGNsaWNrXG4gICAgaWYgKHRoaXMuX2luaXRpYWxpemVkICYmIHRoaXMucG9wdXAuY2xvc2VPbkNsaWNrKSB7XG4gICAgICB0aGlzLmNsb3NlKGZhbHNlKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9zeW5jKCkge1xuICAgIGNvbnN0IGlzVHJpZ2dlclZpc2libGUgPSAhIXRoaXMuX2VsZW1lbnQubmF0aXZlRWxlbWVudC5vZmZzZXRQYXJlbnQ7XG5cbiAgICBpZiAodGhpcy5fbWVudSAmJiB0aGlzLnBvcHVwLm5hbWUpIHtcbiAgICAgIGlmICh0aGlzLmVuYWJsZWQgJiYgaXNUcmlnZ2VyVmlzaWJsZSAmJiAhdGhpcy50dXRvcmlhbFNlcnZpY2UuZ2V0VGFza0NvbXBsZXRlZCh0aGlzLnBvcHVwLm5hbWUpICYmXG4gICAgICAgICF0aGlzLnR1dG9yaWFsU2VydmljZS5kaXNhYmxlZCAmJlxuICAgICAgICB0aGlzLnR1dG9yaWFsU2VydmljZS5ldmFsTXVzdENvbXBsZXRlZCh0aGlzLm11c3RDb21wbGV0ZWQpICYmXG4gICAgICAgIHRoaXMudHV0b3JpYWxTZXJ2aWNlLmV2YWxNdXN0Q29tcGxldGVkKHRoaXMucG9wdXAubXVzdENvbXBsZXRlZCkgJiZcbiAgICAgICAgdGhpcy50dXRvcmlhbFNlcnZpY2UuZXZhbE11c3ROb3REaXNwbGF5aW5nKHRoaXMucG9wdXAubXVzdE5vdERpc3BsYXlpbmcpKSB7XG5cbiAgICAgICAgLy8gc2hvdWxkIGJlIHZpc2libGUsIGJ1dCBsZXQncyBjaGVjayBpZiBwb3B1cCBub3QgYWxyZWFkeSBpbiB1c2UgYnkgb3RoZXIgdHJpZ2dlciAoaW4gdGFibGUgb3IgbmdGb3IpXG4gICAgICAgIGlmICghdGhpcy5wb3B1cC50cmlnZ2VyKSB7XG4gICAgICAgICAgdGhpcy5faW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgICAgIHRoaXMucG9wdXAudHJpZ2dlciA9IHRoaXM7XG4gICAgICAgICAgdGhpcy5wb3B1cC5kYXRhID0gdGhpcy5kYXRhO1xuICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl90aW1lcik7XG4gICAgICAgICAgdGhpcy5fdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHRoaXMub3Blbk1lbnUoKSwgNTAwKTtcbiAgICAgICAgICB0aGlzLnR1dG9yaWFsU2VydmljZS5zZXRJc0Rpc3BsYXlpbmcodGhpcy5wb3B1cC5uYW1lLCB0cnVlKTtcbiAgICAgICAgICB0aGlzLnBvcHVwLm9wZW5lZC5lbWl0KCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodGhpcy5faW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgLy8gb25seSBjbG9zZSBpZiB0aGlzIGlzIG91ciBwb3B1cCAoaW5pdGlhbGl6ZWQpXG4gICAgICAgIHRoaXMuX2luaXRpYWxpemVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMucG9wdXAudHJpZ2dlciA9IG51bGw7XG4gICAgICAgIHRoaXMucG9wdXAuZGF0YSA9IG51bGw7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl90aW1lcik7XG4gICAgICAgIHRoaXMuY2xvc2VNZW51KCk7XG4gICAgICAgIHRoaXMudHV0b3JpYWxTZXJ2aWNlLnNldElzRGlzcGxheWluZyh0aGlzLnBvcHVwLm5hbWUsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5wb3B1cC5jbG9zZWQuZW1pdCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJlcG9zaXRpb24oKSB7XG4gICAgaWYgKHRoaXMuX2luaXRpYWxpemVkICYmIHRoaXMuX2NvbXBvbmVudFN1YnNjcmlwdGlvbikge1xuICAgICAgdGhpcy5jbG9zZU1lbnUoKTtcbiAgICAgIHRoaXMub3Blbk1lbnUoKTtcbiAgICB9XG4gIH1cblxuICBjbG9zZShidXR0b25DbGlja2VkOiBib29sZWFuKSB7XG4gICAgdGhpcy50dXRvcmlhbFNlcnZpY2UubG9nVXNlckFjdGlvbih0aGlzLnBvcHVwLm5hbWUsIGJ1dHRvbkNsaWNrZWQgPyBCZGNEaXNwbGF5RXZlbnRBY3Rpb24uQnV0dG9uQ2xpY2tlZCA6XG4gICAgICBCZGNEaXNwbGF5RXZlbnRBY3Rpb24uVXNlckNsb3NlZCk7XG4gICAgdGhpcy50dXRvcmlhbFNlcnZpY2Uuc2V0VGFza0NvbXBsZXRlZCh0aGlzLnBvcHVwLm5hbWUpO1xuICAgIHRoaXMudHV0b3JpYWxTZXJ2aWNlLnNldFRhc2tzKHRoaXMucG9wdXAub25DbG9zZUNvbXBsZXRlVGFzayk7XG5cbiAgICBpZiAoYnV0dG9uQ2xpY2tlZCkge1xuICAgICAgdGhpcy50dXRvcmlhbFNlcnZpY2Uuc2V0VGFza3ModGhpcy5wb3B1cC5vbkJ1dHRvbkNvbXBsZXRlVGFzayk7XG4gICAgfVxuICB9XG59XG4iXX0=
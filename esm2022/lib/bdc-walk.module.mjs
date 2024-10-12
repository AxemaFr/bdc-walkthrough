import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { BdcWalkDialogComponent } from './tutorial-dialog/tutorial-dialog.component';
import { BdcWalkPopupComponent } from './tutorial-popup/tutorial-popup.component';
import { BdcWalkTriggerDirective } from './tutorial-popup/tutorial-trigger.directive';
import * as i0 from "@angular/core";
export class BdcWalkModule {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmRjLXdhbGsubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvYmRjLXdhbGt0aHJvdWdoL3NyYy9saWIvYmRjLXdhbGsubW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDekMsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQzdDLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUMzRCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDM0QsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ3ZELE9BQU8sRUFBQyxzQkFBc0IsRUFBQyxNQUFNLDZDQUE2QyxDQUFDO0FBQ25GLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLDJDQUEyQyxDQUFDO0FBQ2hGLE9BQU8sRUFBQyx1QkFBdUIsRUFBQyxNQUFNLDZDQUE2QyxDQUFDOztBQVNwRixNQUFNLE9BQU8sYUFBYTs4R0FBYixhQUFhOytHQUFiLGFBQWEsaUJBTlQsc0JBQXNCLEVBQUUscUJBQXFCLEVBQUUsdUJBQXVCLGFBRW5GLFlBQVksRUFBRSxlQUFlLEVBQUUsZUFBZSxFQUFFLGFBQWEsYUFFckQsc0JBQXNCLEVBQUUscUJBQXFCLEVBQUUsdUJBQXVCOytHQUVyRSxhQUFhLFlBSnRCLFlBQVksRUFBRSxlQUFlLEVBQUUsZUFBZSxFQUFFLGFBQWE7OzJGQUlwRCxhQUFhO2tCQVB6QixRQUFRO21CQUFDO29CQUNSLFlBQVksRUFBRSxDQUFDLHNCQUFzQixFQUFFLHFCQUFxQixFQUFFLHVCQUF1QixDQUFDO29CQUN0RixPQUFPLEVBQUU7d0JBQ1AsWUFBWSxFQUFFLGVBQWUsRUFBRSxlQUFlLEVBQUUsYUFBYTtxQkFDOUQ7b0JBQ0QsT0FBTyxFQUFFLENBQUMsc0JBQXNCLEVBQUUscUJBQXFCLEVBQUUsdUJBQXVCLENBQUM7aUJBQ2xGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Q29tbW9uTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgTWF0QnV0dG9uTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvYnV0dG9uJztcbmltcG9ydCB7IE1hdERpYWxvZ01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2RpYWxvZyc7XG5pbXBvcnQgeyBNYXRNZW51TW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvbWVudSc7XG5pbXBvcnQge0JkY1dhbGtEaWFsb2dDb21wb25lbnR9IGZyb20gJy4vdHV0b3JpYWwtZGlhbG9nL3R1dG9yaWFsLWRpYWxvZy5jb21wb25lbnQnO1xuaW1wb3J0IHtCZGNXYWxrUG9wdXBDb21wb25lbnR9IGZyb20gJy4vdHV0b3JpYWwtcG9wdXAvdHV0b3JpYWwtcG9wdXAuY29tcG9uZW50JztcbmltcG9ydCB7QmRjV2Fsa1RyaWdnZXJEaXJlY3RpdmV9IGZyb20gJy4vdHV0b3JpYWwtcG9wdXAvdHV0b3JpYWwtdHJpZ2dlci5kaXJlY3RpdmUnO1xuXG5ATmdNb2R1bGUoe1xuICBkZWNsYXJhdGlvbnM6IFtCZGNXYWxrRGlhbG9nQ29tcG9uZW50LCBCZGNXYWxrUG9wdXBDb21wb25lbnQsIEJkY1dhbGtUcmlnZ2VyRGlyZWN0aXZlXSxcbiAgaW1wb3J0czogW1xuICAgIENvbW1vbk1vZHVsZSwgTWF0QnV0dG9uTW9kdWxlLCBNYXREaWFsb2dNb2R1bGUsIE1hdE1lbnVNb2R1bGVcbiAgXSxcbiAgZXhwb3J0czogW0JkY1dhbGtEaWFsb2dDb21wb25lbnQsIEJkY1dhbGtQb3B1cENvbXBvbmVudCwgQmRjV2Fsa1RyaWdnZXJEaXJlY3RpdmVdXG59KVxuZXhwb3J0IGNsYXNzIEJkY1dhbGtNb2R1bGUgeyB9XG4iXX0=
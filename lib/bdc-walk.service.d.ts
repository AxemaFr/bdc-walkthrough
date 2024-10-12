import * as i0 from "@angular/core";
export declare class BdcWalkService {
    private _notify;
    private _notifyDisplaying;
    private _values;
    private _displaying;
    private _version;
    private _key;
    private _disabled;
    changes: import("rxjs").Observable<void>;
    changesDisplaying: import("rxjs").Observable<BdcDisplayEvent>;
    get disabled(): boolean;
    constructor();
    migrate(migrations: BdcWalkMigration[]): void;
    getIsDisplaying(id: string): boolean;
    setIsDisplaying(id: string, visible: boolean): void;
    logUserAction(id: string, action: BdcDisplayEventAction): void;
    getTaskCompleted(id: string): any | boolean;
    setTaskCompleted(id: string, value?: any | boolean): void;
    setTasks(tasks: TaskList): void;
    getTasks(): {
        [x: string]: any;
    };
    reset(prefix?: string): void;
    disableAll(disabled?: boolean): void;
    private _isCompleteMatch;
    private _isEqual;
    evalMustCompleted(mustCompleted: TaskList): boolean;
    evalMustNotDisplaying(mustNotDisplaying: string[]): boolean;
    private save;
    static ɵfac: i0.ɵɵFactoryDeclaration<BdcWalkService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<BdcWalkService>;
}
export interface TaskList {
    [taskName: string]: any | boolean;
}
export interface BdcWalkMigration {
    version: number;
    operations: {
        condition: TaskList;
        then: TaskList;
    }[];
}
export interface BdcDisplayEvent {
    id: string;
    visible: boolean;
    action: BdcDisplayEventAction;
}
export declare enum BdcDisplayEventAction {
    VisibilityChanged = 0,
    UserClosed = 1,
    ButtonClicked = 2
}

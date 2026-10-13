/** One step of the navigation trail. */
export interface Breadcrumb {
    label: string;

    /** Absolute URL of the step, built from the route segments leading to it. */
    url: string;
}

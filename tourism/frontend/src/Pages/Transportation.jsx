import ServiceCategoryView from "./ServiceCategoryView";

export default function Transportation() {
    return (
        <ServiceCategoryView
            serviceType="Transportation"
            title="Explore Transportation"
            fallbackIcon="🚗"
            searchPlaceholder="Search transportation by name, starting location, vehicles..."
        />
    );
}

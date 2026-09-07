import ServiceCategoryView from "./ServiceCategoryView";

export default function Activities() {
    return (
        <ServiceCategoryView
            serviceType="Activity"
            title="Explore Activities & Adventures"
            fallbackIcon="🎯"
            searchPlaceholder="Search activities by name, location, adventure type..."
        />
    );
}

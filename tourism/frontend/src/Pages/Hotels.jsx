import ServiceCategoryView from "./ServiceCategoryView";

export default function Hotels() {
    return (
        <ServiceCategoryView
            serviceType="Hotel"
            title="Explore Hotels & Resorts"
            fallbackIcon="🏨"
            searchPlaceholder="Search hotels by name, location, district, or facilities..."
        />
    );
}

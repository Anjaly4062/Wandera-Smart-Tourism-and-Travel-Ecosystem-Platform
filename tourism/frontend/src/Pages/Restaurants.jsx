import ServiceCategoryView from "./ServiceCategoryView";

export default function Restaurants() {
    return (
        <ServiceCategoryView
            serviceType="Restaurant"
            title="Explore Restaurants & Cafes"
            fallbackIcon="🍽️"
            searchPlaceholder="Search restaurants by cuisine, name, location, district..."
        />
    );
}

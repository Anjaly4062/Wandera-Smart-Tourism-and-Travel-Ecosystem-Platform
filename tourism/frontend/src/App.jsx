import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Register from "./Pages/Register";
import Login from "./Pages/Login";
import AdminHome from "./Pages/AdminHome";
import AdminTourists from "./Pages/AdminTourists";
import AdminServiceProviders from "./Pages/AdminServiceProviders";
import AdminProviderRequest from "./Pages/AdminProviderRequest";
import AdminBookings from "./Pages/AdminBookings";
import ServiceProviderHome from "./Pages/ServiceProviderHome";
import AdminAddDestination from "./Pages/AdminAddDestination";
import ViewDestination from "./Pages/ViewDestination";
import AddService from "./Pages/AddService";
import AddHotel from "./Pages/AddHotel";
import AddRoom from "./Pages/AddRoom";
import AddRestaurant from "./Pages/AddRestaurant";
import AddTransportation from "./Pages/AddTransportation";
import AddVehicle from "./Pages/AddVehicle";
import AddActivity from "./Pages/AddActivity";
import AddActivityItem from "./Pages/AddActivityItem";
import MyServices from "./Pages/MyServices";
import MyProfile from "./Pages/MyProfile";
import ServiceProviderProfile from "./Pages/ServiceProviderProfile";
import DestinationDetails  from "./Pages/DestinationDetails";
import ServiceDetails from "./Pages/ServiceDetails";
import PlanTrip from "./Pages/PlanTrip";
import ProviderBookings from "./Pages/ProviderBookings";
import HiddenSpots from "./Pages/HiddenSpots";
import SubmitHiddenSpot from "./Pages/SubmitHiddenSpot";
import AdminHiddenSpots from "./Pages/AdminHiddenSpots";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Home />} />
        
        <Route path="/signup" element={<Register/>}/>

        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/admin/tourists" element={<AdminTourists />} />
        <Route path="/admin/service-providers" element={<AdminServiceProviders />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
        <Route path="/admin/hidden-spots" element={<AdminHiddenSpots />} />
        <Route path="/admin/provider-request" element={<AdminProviderRequest />}/>
        <Route path="/my-profile" element={<MyProfile />} />
        <Route path="/provider-home" element={<ServiceProviderHome />} />
        <Route path="/provider/profile" element={<ServiceProviderProfile />} />
        <Route path="/admin/add-destination" element={<AdminAddDestination />}/>
        <Route path="/destinations" element={<ViewDestination />}/>
        <Route path="/hidden-spots" element={<HiddenSpots />}/>
        <Route path="/submit-hidden-spot" element={<SubmitHiddenSpot />}/>
        <Route path="/provider/add-service" element={<AddService/>}/>
        <Route path="/provider/add-hotel" element={<AddHotel/>}/>
        <Route path="/provider/add-room" element={<AddRoom/>}/>
        <Route path="/provider/add-restaurant" element={<AddRestaurant/>}/>
        <Route path="/provider/add-transportation" element={<AddTransportation/>}/>
        <Route path="/provider/add-vehicle" element={<AddVehicle/>}/>
        <Route path="/provider/add-activity" element={<AddActivity/>}/>
        <Route path="/provider/add-activity-item" element={<AddActivityItem/>}/>
        <Route path="/provider/my-services" element={<MyServices/>}/>
        <Route path="/provider/bookings" element={<ProviderBookings />}/>
        <Route path="/view/:destinationId" element={<DestinationDetails />}/>
        <Route path="/service/:providerId" element={<ServiceDetails />}/>
        <Route path="/plan-your-trip" element={<PlanTrip />}/>
        <Route path="/my-trip" element={<PlanTrip />}/>

      </Routes>

    </BrowserRouter>
  );
}

export default App;
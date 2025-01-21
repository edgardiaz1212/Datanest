import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "./component/scrollToTop";
import { BackendURL } from "./component/backendURL";
import { Home } from "./pages/home";
import injectContext from "./store/appContext";
import { Navbar } from "./component/navbar";
import { Footer } from "./component/footer";
import DataTable from "./pages/DataTable.jsx";
import CompleteData from "./pages/CompleteData.jsx";
import EditData from "./pages/EditData.jsx";

const Layout = () => {
    const basename = process.env.BASENAME_REACT || "";

    if (!process.env.BACKEND_URL || process.env.BACKEND_URL === "") {
        return <BackendURL />;
    }

    return (
        <div>
            <BrowserRouter basename={basename}future={{ v7_startTransition: true }}>
                <ScrollToTop>
                    <Navbar />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/register-data" element={<DataTable />} />
                        <Route path="/complete-data" element={<CompleteData />} />
                        <Route path="/edit-data" element={<EditData />} />
                        <Route path="*" element={<h1>Not found!</h1>} />
                    </Routes>
                    <Footer />
                </ScrollToTop>
            </BrowserRouter>
        </div>
    );
};

export default injectContext(Layout);
import React from 'react'
import Header from "../header/Header.jsx";
import {Outlet} from "react-router-dom";
import Footer from "../footer/Footer.jsx";
import Sidebar from "../Sidebar.jsx";
import Widgets from "../Widgets.jsx";

const RootLayout = () => {
    return (
        <>
            <Header/>
            <main className='main'>
                <div className='container main__container'>
                    <Sidebar/>
                    <Outlet/>
                    <Widgets/>
                </div>
            </main>

        </>
    )
}
export default RootLayout

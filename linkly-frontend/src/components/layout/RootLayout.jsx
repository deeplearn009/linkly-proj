import React, {useEffect} from 'react'
import Header from "../header/Header.jsx";
import {Outlet} from "react-router-dom";
import Footer from "../footer/Footer.jsx";
import Sidebar from "../Sidebar.jsx";
import Widgets from "../Widgets.jsx";
import {useSelector} from "react-redux";
import ThemeModal from "../ThemeModal.jsx";

const RootLayout = () => {

    const {themeModalIsOpen} = useSelector(state => state?.ui)
    const {primaryColor, backgroundColor} = useSelector(state => state?.ui?.theme);

    useEffect(() => {
        const body = document.body;
        body.className = `${primaryColor} ${backgroundColor}`;
    }, [primaryColor, backgroundColor]);

    return (
        <>
            <Header/>
            <main className='main'>
                <div className='container main__container'>
                    <Sidebar/>
                    <Outlet/>
                    <Widgets/>
                    {themeModalIsOpen && <ThemeModal/>}
                </div>
            </main>

        </>
    )
}
export default RootLayout

import React, {useEffect} from 'react'
import Header from "../header/Header.jsx";
import {Outlet, useLocation} from "react-router-dom";
import Footer from "../footer/Footer.jsx";
import Sidebar from "../Sidebar.jsx";
import Widgets from "../Widgets.jsx";
import {useSelector} from "react-redux";
import ThemeModal from "../ThemeModal.jsx";
import { motion, AnimatePresence } from 'framer-motion';

const RootLayout = () => {
    const location = useLocation();
    const {themeModalIsOpen} = useSelector(state => state?.ui)
    const {primaryColor, backgroundColor} = useSelector(state => state?.ui?.theme);

    useEffect(() => {
        const body = document.body;
        body.className = `${primaryColor} ${backgroundColor}`;
    }, [primaryColor, backgroundColor]);

    const pageVariants = {
        initial: {
            opacity: 0,
            x: -20
        },
        animate: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.3,
                ease: "easeOut"
            }
        },
        exit: {
            opacity: 0,
            x: 20,
            transition: {
                duration: 0.2,
                ease: "easeIn"
            }
        }
    };

    return (
        <>
            <Header/>
            <main className='main'>
                <div className='container main__container'>
                    <Sidebar/>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            variants={pageVariants}
                            className="outlet-container"
                        >
                            <Outlet/>
                        </motion.div>
                    </AnimatePresence>
                    <Widgets/>
                    {themeModalIsOpen && <ThemeModal/>}
                </div>
            </main>
        </>
    )
}
export default RootLayout

import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Container from 'react-bootstrap/Container';
import { NavLink } from "react-router-dom";
import { useLocation } from 'react-router-dom';

import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { useState, useEffect, useRef } from 'react';
import { FaWallet } from 'react-icons/fa'; // FontAwesome wallet icon
import { SlArrowDown } from "react-icons/sl";

import axios from 'axios';
const logo = `${process.env.REACT_APP_API_IMAGES_PATH}/images/logo.png`;
const wallet = `${process.env.REACT_APP_API_IMAGES_PATH}/images/wallet.png`;

const Header = () => {
    const [showNavbar, setShowNavbar] = useState(false);
    const [walletAddress, setWalletAddress] = useState("");
    const [balance, setBalance] = useState(null);
    const [loading, setLoading] = useState(false);
    const [walletBalance, setWalletBalance] = useState("");
    const location = useLocation();
    const { pathname } = location;
    // Control whether the navbar should be shown based on screen size
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 992) {
                setShowNavbar(true);
            } else {
                setShowNavbar(false);
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize(); // Initial check

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [qrUrl, setQrUrl] = useState("");
    const [uuid, setUuid] = useState("");
    const [walletConnected, setWalletConnected] = useState(false);
    const popupRef = useRef(null);

    const [polling, setPolling] = useState(false);
    // Load from localStorage on first render
    const initiateSignIn = async () => {
        try {
            const response = await axios.post("https://oddsdrive1.com/api/signin");
            const { qrUrl, payloadUuid } = response.data;
            setQrUrl(qrUrl);
            setUuid(payloadUuid);
            setPolling(true);
            // Open popup and save reference
            const popup = window.open(
                qrUrl,
                "_blank",
                "toolbar=no,scrollbars=yes,resizable=yes,top=100,right=500,width=400,height=400"
            );
            popupRef.current = popup;

            if (!popup) {
                alert("Popup blocked. Please allow popups for this site.");
            }
        } catch (err) {
            console.error("Sign-in error", err);
        }
    };

    useEffect(() => {
        const storedData = localStorage.getItem("walletInfo");
        if (storedData) {
            try {
                const parsed = JSON.parse(storedData);
                setWalletAddress(parsed.account);
                setWalletBalance(parsed.balance);
                setWalletConnected(true);
            } catch (err) {
                console.error("Error parsing wallet info", err);
            }
        }
    }, []);

    useEffect(() => {
        let interval;
        if (polling && uuid) {
            localStorage.setItem("id", JSON.stringify({ uuid }));
            interval = setInterval(async () => {
                try {
                    const res = await axios.get(`https://oddsdrive1.com/api/account-info/${uuid}`);
                    if (res.data.signed) {
                        const { account, balance } = res.data;
                        setWalletAddress(account);
                        setWalletBalance(balance);
                        setWalletConnected(true);
                        localStorage.setItem("walletInfo", JSON.stringify({ account, balance }));
                        // Close the popup
                        if (popupRef.current && !popupRef.current.closed) {
                            popupRef.current.close();
                        }

                        setTimeout(() => {
                            window.location.reload();
                        }, 1000);

                        setPolling(false);
                        clearInterval(interval);
                    }
                } catch (err) {
                    // Silent polling error
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [polling, uuid]);

    const disconnectWallet = () => {
        localStorage.removeItem("walletInfo");
        localStorage.removeItem("id");
        setWalletConnected(false);
        setWalletAddress("");
        setWalletBalance("");
        setUuid("");
        setQrUrl("");
        setTimeout(() => {
            window.location.reload();
        }, 1000);


    };
    return (
        <header className="main_header">

            <Navbar expand="md" className="navbar navbar-expand-md secondary-black text-white main_navbar">
                <Container fluid>
                    <Navbar.Brand href="/markets">
                        <img src={logo} alt="Logo" />
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav">
                        <span className="navbar-toggler-icon">
                            <FontAwesomeIcon icon={faBars} />
                        </span>
                    </Navbar.Toggle>
                    <Navbar.Collapse id="basic-navbar-nav" className='justify-content-center'>
                        <Nav className="mx-auto d-flex">
                            <Nav.Link
                                href="https://iosandweb.com/"
                                target="_blank"
                                rel="noreferrer"
                                className='nav-links'
                            >
                                Home
                            </Nav.Link>

                            <Nav.Link
                                href="/markets/trade"
                                className={`nav-links ${pathname === '/markets/trade' ? 'active' : ''}`}
                            >
                                Trade
                            </Nav.Link>

                            <Nav.Link
                                href="/markets"
                                className={`nav-links ${pathname === '/markets' ? 'active' : ''}`}
                            >
                                Market
                            </Nav.Link>
                        </Nav>
                        <Nav className="d-flex gap-2">
                            {/* Show when walletAddress is not available */}
                            {!walletAddress && (
                                <>
                                    <Nav.Link className='btn-primary-red nav_btn'>Log In / Sign Up</Nav.Link>
                                    <button
                                        className="nav-link btn-primary-green nav_btn"
                                        id="wallet-connect-btn"
                                        onClick={initiateSignIn}
                                    >
                                        <img src={wallet} alt="wallet" className="menu_icon" /> Connect Wallet
                                    </button>
                                </>
                            )}

                            {/* Show when walletAddress is available */}
                            {walletAddress && (
                                <>



                                    <NavDropdown
                                        id="wallet-nav-dropdown"
                                        className="wallet-nav-dropdown"
                                        title={
                                            <span className="gradient-texts d-inline-flex align-items-center">

                                                <span className="gradient-texts wallet-adddres">Connected - {walletAddress.slice(0, 4)}....{walletAddress.slice(-4)}</span>
                                                <SlArrowDown className="ms-1" />
                                            </span>
                                        }
                                        align="start" // Makes dropdown left-aligned with parent
                                    >
                                        <NavDropdown.Item id="disconnect-xumm" onClick={disconnectWallet}>
                                            Disconnect
                                        </NavDropdown.Item>
                                    </NavDropdown>




                                    {/* <div className='wallet-adddres'>
         <span className='gradient-texts'>
            Connected - {walletAddress.slice(0, 4)}....{walletAddress.slice(-4)}
        </span>
           </div>
         <NavDropdown title={<SlArrowDown  />} id="basic-nav-dropdown">
            <NavDropdown.Item id="disconnect-xumm" onClick={disconnectWallet}>
                Disconnect
            </NavDropdown.Item>
        </NavDropdown> */}


                                </>
                            )}
                        </Nav>

                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </header>
    )
}

export default Header;

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { SlArrowDown } from "react-icons/sl";
import Row from "react-bootstrap/Row";
// import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { GoArrowDown, GoArrowUp } from "react-icons/go";

import Modal from "react-bootstrap/Modal";
import { IoIosArrowDown } from "react-icons/io";
import { HiArrowLeft } from "react-icons/hi";

import { XummSdk } from 'xumm-sdk';
import { ToastContainer, toast } from 'react-toastify';

import { ClipLoader } from "react-spinners";

// // import Pagination from 'react-bootstrap/Pagination';
const redfullBitcoin = `${process.env.REACT_APP_API_IMAGES_PATH}/images/bitcoin.png`;
const redfullBitcoingraph = `${process.env.REACT_APP_API_IMAGES_PATH}/images/graph.png`;

function Trade() {
    const [walletInfo, setWalletInfo] = useState(null);
    const [isChecked, setIsChecked] = useState(true);
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/tv.js';
        script.async = true;

        script.onload = () => {
            if (window.TradingView) {
                new window.TradingView.widget({
                    container_id: 'tradingview-widget',
                    width: '100%', // make width responsive
                    height: 630,   // fixed height
                    symbol: 'BTCUSDT',
                    interval: 'D',
                    timezone: 'Etc/UTC',
                    theme: 'Dark',
                    style: '1',
                    locale: 'en',
                    toolbar_bg: '#18191A',
                    enable_publishing: false,
                    hide_side_toolbar: true,
                    allow_symbol_change: true,
                    details: true,
                    hideideas: true
                });
            }
        };

        document.body.appendChild(script);
    }, []);


    const handleCheckboxChange = (e) => {
        setIsChecked(e.target.checked);
    };


    const [activeTab, setActiveTab] = useState('left_right');


    const tabs = [
        { id: 'left_right', src: 'assests/images/left-right.png', alt: 'Left Right' },
        { id: 'top_bottom', src: 'assests/images/top-bottom.png', alt: 'Top Bottom' },
        { id: 'green_full', src: 'assests/images/green-full.png', alt: 'Green Full' },
        { id: 'red_full', src: 'assests/images/red-full.png', alt: 'Red Full' }
    ];


    useEffect(() => {
        const storedWallet = localStorage.getItem('walletInfo');
        if (storedWallet) {
            try {
                const parsedWallet = JSON.parse(storedWallet);
                setWalletInfo(parsedWallet);
            } catch (error) {
                console.error('Invalid walletInfo in localStorage');
            }
        }
    }, []);





    const [cryptoList, setCryptoList] = useState([]);
    const [searchSend, setSearchSend] = useState("");
    const [searchReceive, setSearchReceive] = useState("");
    const [selectedCoin, setSelectedCoin] = useState({
        symbol: "XRP",
        name: "XRP",
        image: "https://coin-images.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png?1696501442"
    });
    const [selectedCoin1, setSelectedCoin1] = useState({
        symbol: "Eth",
        name: "Ethereum",
        image: "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
    }); // receive coin
    const [sendAmount, setSendAmount] = useState("0.0"); // user entered amount
    const [calculatedReceiveAmount, setCalculatedReceiveAmount] = useState(); // auto calculated amount
    const [showSendModal, setShowSendModal] = useState(false);
    const [showReceiveModal, setShowReceiveModal] = useState(false);
    // const [result, setResult] = useState(null);
    const [ethAddress, setEthAddress] = useState("");
    const [isLoading, setIsLoading] = useState(false); // ✅ RIGHT HERE at top-level
    const popupRef = useRef(null);
    const [polling, setPolling] = useState(false);

    // Fetch crypto data from CoinGecko
    useEffect(() => {
        axios
            .get("https://api.coingecko.com/api/v3/coins/markets", {
                params: {
                    vs_currency: "usd",
                    order: "market_cap_desc",
                    per_page: 300,
                    page: 1,
                    sparkline: false,
                },
            })
            .then((res) => {
                setCryptoList(res.data);
            })
            .catch((err) => {
                console.error("Error fetching crypto data:", err);
            });
    }, []);

    // Calculate exchange rate when amount, send or receive coin changes
    useEffect(() => {
        if (selectedCoin && selectedCoin1 && sendAmount) {
            const sendPrice = selectedCoin.current_price;     // in USD
            const receivePrice = selectedCoin1.current_price; // in USD
            const totalUSD = sendAmount * sendPrice;
            const receiveAmount = totalUSD / receivePrice;

            setCalculatedReceiveAmount(receiveAmount.toFixed(6));
        } else {
            setCalculatedReceiveAmount("");
        }
    }, [sendAmount, selectedCoin, selectedCoin1]);

    // Filtering send and receive coin lists based on search
    const filteredSendList = cryptoList.filter(
        (coin) =>
            coin.name.toLowerCase().includes(searchSend.toLowerCase()) ||
            coin.symbol.toLowerCase().includes(searchSend.toLowerCase())
    );

    const filteredReceiveList = cryptoList.filter(
        (coin) =>
            coin.name.toLowerCase().includes(searchReceive.toLowerCase()) ||
            coin.symbol.toLowerCase().includes(searchReceive.toLowerCase())
    );

    const handleCoinSelect = (coin) => {
        setSelectedCoin(coin);
        setShowSendModal(false);
        setSearchSend("");
    };

    const handleCoinSelect1 = (coin) => {
        setSelectedCoin1(coin);
        setShowReceiveModal(false);
        setSearchReceive("");
    };



    const [isSwapped, setIsSwapped] = useState(false);
    const toggleSwap = () => {
        setIsSwapped((prev) => !prev);
    };

    const [balance, setBalance] = useState("0.0");
    const [account, setWalletBalance] = useState("");
    // Retrieve wallet details
    useEffect(() => {
        const storedWallet = localStorage.getItem("walletInfo");
        if (storedWallet) {
            const { account, balance } = JSON.parse(storedWallet);
            setWalletBalance(account);
            setBalance(balance);
        }
    }, []);




    // ✅ Only get and set localStorage data on first load

    const [uuid, setUuid] = useState("");
    useEffect(() => {

        const storedWalletid = localStorage.getItem("id");
        if (storedWalletid) {
            const { uuid, } = JSON.parse(storedWalletid);
            setUuid(uuid);
            console.log(uuid)
        }
    }, []); // empty dependency array = run once on mount

    // Handle exchange request

    const handleExchange = async (account) => {
        if (!account) {
            toast.error("Please connect your XRP Account");
            setTimeout(() => {
                window.location.reload();
            }, 4000);
            return;
        }

        if (!sendAmount || !calculatedReceiveAmount || !ethAddress) {
            toast.error("Please fill all field");
            return;
        }

        setIsLoading(true);

        try {
            // STEP 1: Create Payload
            const { data } = await axios.post("https://oddsdrive1.com/api/create-payload", {
                account: account,
                amount: sendAmount,
            });

            const payloadUrl = data.next.always;
            const uuid = data.uuid;
            setPolling(true);

            const popup = window.open(
                payloadUrl,
                "_blank",
                "toolbar=no,scrollbars=yes,resizable=yes,top=100,right=500,width=300,height=500"
            );
            popupRef.current = popup;

            // STEP 2: Poll for signature
            let attempts = 0;
            const maxAttempts = 20;

            const interval = setInterval(async () => {
                try {
                    const statusRes = await axios.get(`https://oddsdrive1.com/api/payload-status/${uuid}`);

                    if (statusRes.data.meta.signed) {
                        clearInterval(interval);
                        const signedTx = statusRes.data.response.txid;

                        // STEP 3: Trigger exchange
                        const exchangeRes = await axios.post("https://oddsdrive1.com/api/exchange", {
                            ethAddress: ethAddress,
                            xrpAmount: sendAmount,
                            toEthAmount: calculatedReceiveAmount,
                            signedXrpTx: signedTx,
                        });

                        const { xrpTxHash, ethTxHash } = exchangeRes.data;

                        if (popupRef.current && !popupRef.current.closed) {
                            popupRef.current.close();
                        }

                        setTimeout(() => {
                            window.location.reload();
                        }, 2000);

                        setPolling(false);

                        if (xrpTxHash && ethTxHash) {
                            toast.success("Exchange successful: XRP to Ethereum.");
                            setIsLoading(false);
                            setEthAddress("");
                        } else {
                            toast.error("❌ Error: Missing transaction hashes.");
                            setIsLoading(false);
                        }
                    } else if (attempts >= maxAttempts) {
                        clearInterval(interval);
                        if (popupRef.current && !popupRef.current.closed) {
                            popupRef.current.close();
                        }
                        toast.error("❌ Timed out. Transaction not signed.");
                        setIsLoading(false);
                    }
                    attempts++;
                } catch (err) {
                    clearInterval(interval);
                    if (popupRef.current && !popupRef.current.closed) {
                        popupRef.current.close();
                    }
                    console.error("Polling Error:", err);
                    toast.error("❌ Error checking signature status.");
                    setIsLoading(false);
                }
            }, 2000);
        } catch (err) {
            if (popupRef.current && !popupRef.current.closed) {
                popupRef.current.close();
            }
            console.error("Exchange Error:", err);
            toast.error("Something went wrong during the exchange.");
            setIsLoading(false);
        }
    };
    return (
        <>
            <section class="trade_graph_section section-padding">
                <div class="container-fluid">
                    <div class="row graph_block_row">
                        <div class="col graph_col">

                            <div class="trade_left_block p-0">
                                <div class="trade_amount_block">
                                    <div class="trade_amount_currency">
                                        <img src={redfullBitcoin} alt="Bitcoin" class="currency_icon" />
                                        <div class="trade_currency_text">
                                            <h4 class="trade_heading">BTC/USDT</h4>
                                            <p class="text-small text-gray">Bitcoin  | BTC Network</p>
                                        </div>
                                    </div>

                                    <div class="trade_currency_block">
                                        <div class="trade_currency_item">
                                            <h2 class="trade_amount">$ 94,727.60 </h2>
                                            <p class="text-small text-white">≈103,757.10 USD</p>
                                        </div>
                                        <div class="trade_currency_item">
                                            <p class="text-small text-bold">24H Change</p>
                                            <p class="text-small text-white">-0.30%</p>
                                        </div>
                                        <div class="trade_currency_item">
                                            <p class="text-small text-bold">24H High</p>
                                            <p class="text-small text-white">95,197.0</p>
                                        </div>
                                        <div class="trade_currency_item">
                                            <p class="text-small text-bold">24H Low</p>
                                            <p class="text-small text-white">93609.6</p>
                                        </div>
                                        <div class="trade_currency_item">
                                            <p class="text-small text-bold">24H Turnover</p>
                                            <p class="text-small text-white">721,248,87.46</p>
                                        </div>
                                        <div class="trade_currency_item">
                                            <p class="text-small text-bold">Daily Interest Rate</p>
                                            <p class="text-small text-white">0.00283507%|0.01044111%</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="container-fluid graph_container">
                                <div class="row graph_block_row">
                                    <div class="col-lg-9 graph-col">
                                        <div className="graph_block">
                                            <div id="tradingview-widget" className="tradingview-container" />

                                        </div>
                                    </div>

                                    <div class="col-lg-3 col trade_col">
                                        <div class="trade_order_block">
                                            <ul class="nav nav-pills">
                                                <li class="nav-item">
                                                    <a class="nav-link active" data-bs-toggle="pill" href="#order_book">Order Book</a>
                                                </li>
                                                <li class="nav-item">
                                                    <a class="nav-link" data-bs-toggle="pill" href="#recent_trade">Recent Trade</a>
                                                </li>
                                            </ul>

                                            <div class="tab-content">

                                                <div class="tab-pane active" id="order_book">

                                                    <div class="order_book_grid">
                                                        <ul className="order_grid">
                                                            {tabs.map(tab => (
                                                                <li key={tab.id}>
                                                                    <img
                                                                        src={tab.src}
                                                                        alt={tab.alt}
                                                                        className={`grid_images ${activeTab === tab.id ? 'active' : ''}`}
                                                                        data-id={tab.id}
                                                                        onClick={() => setActiveTab(tab.id)}
                                                                        style={{ cursor: 'pointer', opacity: activeTab === tab.id ? 1 : 0.5, width: '16px' }}
                                                                    />
                                                                </li>
                                                            ))}
                                                        </ul>

                                                        <select id="grid_select" name="grid_select" className="form-control form-select">
                                                            <option value="0.1">0.1</option>
                                                            <option value="1">1</option>
                                                            <option value="10">10</option>
                                                            <option value="100">100</option>
                                                            <option value="1000">1000</option>
                                                        </select>
                                                    </div>

                                                    {/* <!-- Order Book table --> */}
                                                    <div class="order_book_table_block" id={activeTab}>
                                                        {/* <!-- Sell Table --> */}
                                                        <table class="order_book_red_table order_book_table">
                                                            <thead>
                                                                <tr>
                                                                    <th>Price USDT</th>
                                                                    <th>Quantity (BTC)</th>
                                                                    <th class="data_total">
                                                                        <select class="form-select-table" id="order_select_currency">
                                                                            <option value="Total (BTC)">Total (BTC)</option>
                                                                            <option value="Total (USDT)">Total (USDT)</option>
                                                                        </select>
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr>
                                                                    <td class="bg-primary-red text-red">94,555.00</td>
                                                                    <td class="bg-primary-red text-light-red">0.0005689</td>
                                                                    <td class="bg-primary-red text-light-red data_total">0.5674337</td>
                                                                </tr>
                                                                <tr>
                                                                    <td class="text-red">93,555.00</td>
                                                                    <td>0.9988770</td>
                                                                    <td class="data_total">0.4683778</td>
                                                                </tr>
                                                                <tr>
                                                                    <td class="text-red">94,555.07</td>
                                                                    <td>0.6789567</td>
                                                                    <td class="bg-primary-red text-light-red data_total">0.5578356</td>
                                                                </tr>
                                                                <tr>
                                                                    <td class="text-red">94,555.08</td>
                                                                    <td>0.9876453</td>
                                                                    <td class="data_total">0.4672268</td>
                                                                </tr>
                                                                <tr>
                                                                    <td class="text-red">94,555.03</td>
                                                                    <td>0.5634579</td>
                                                                    <td class="data_total">0.2456726</td>
                                                                </tr>
                                                                <tr>
                                                                    <td class="text-red">94,555.01</td>
                                                                    <td>0.6574839</td>
                                                                    <td class="data_total">6.8990589</td>
                                                                </tr>
                                                                <tr>
                                                                    <td class="text-red">93,555.02</td>
                                                                    <td>0.6574839</td>
                                                                    <td class="data_total">6.8990589</td>
                                                                </tr>
                                                                <tr>
                                                                    <td class="text-red">93,555.02</td>
                                                                    <td>0.6574839</td>
                                                                    <td class="data_total">6.8990589</td>
                                                                </tr>
                                                                <tr>
                                                                    <td class="bg-primary-red text-red">93,777.00</td>
                                                                    <td class="bg-primary-red text-light-red">012345980</td>
                                                                    <td class="bg-primary-red text-light-red data_total">4.7884774</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                        <table class="order_book_green_table order_book_table">
                                                            <thead>
                                                                <tr>
                                                                    <th>Price USDT</th>
                                                                    <th>Quantity (BTC)</th>
                                                                    <th class="data_total">
                                                                        <select class="form-select-table" id="order_select_green_currency">
                                                                            <option value="Total (BTC)">Total (BTC)</option>
                                                                            <option value="Total (USDT)">Total (USDT)</option>
                                                                        </select>
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr>
                                                                    <td class="bg-primary-green text-green">95,557.00</td>
                                                                    <td class="bg-primary-green text-light-green">4.778990</td>
                                                                    <td class="bg-primary-green text-light-green data_total">4.978946</td>
                                                                </tr>
                                                                <tr>
                                                                    <td class="text-green">95,779.00</td>
                                                                    <td>8.990056</td>
                                                                    <td class="data_total">6.987645</td>
                                                                </tr>
                                                                <tr>
                                                                    <td class="text-green">95,777.00</td>
                                                                    <td>3.889966</td>
                                                                    <td class="data_total">6.993345</td>
                                                                </tr>
                                                                <tr>
                                                                    <td class="text-green">94,666.00</td>
                                                                    <td>3.899788</td>
                                                                    <td class="data_total">8.556677</td>
                                                                </tr>
                                                                <tr>
                                                                    <td class="text-green">93,777.00</td>
                                                                    <td>4.989788</td>
                                                                    <td class="data_total">3.887766</td>
                                                                </tr>
                                                                <tr>
                                                                    <td class="text-green">95,777.00</td>
                                                                    <td>7.345623</td>
                                                                    <td class="data_total">4.005566</td>
                                                                </tr>
                                                                <tr>
                                                                    <td class="text-green">92,888.00</td>
                                                                    <td>3.876567</td>
                                                                    <td class="data_total">3.789024</td>
                                                                </tr>
                                                                <tr>
                                                                    <td class="text-green">92,888.00</td>
                                                                    <td>3.876567</td>
                                                                    <td class="data_total">3.789024</td>
                                                                </tr>

                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    <div class="sell_up_block">
                                                        <div class="sell_up_right_block">
                                                            <h3 class="up_text_left up_text_col">
                                                                <i class="fa fa-long-arrow-up" aria-hidden="true"></i>
                                                                <span>94,727.60</span>
                                                            </h3>
                                                            <h4 class="up_text_right up_text_col">
                                                                <span class="icon">&#8776;</span>
                                                                <span>94,727.60</span>
                                                            </h4>
                                                        </div>
                                                    </div>
                                                    <div class="buy_sell_split">
                                                        <div class="buy_split">
                                                            <p class="buy_sell_text">Buy <span>43%</span></p>
                                                        </div>
                                                        <div class="sell_split">
                                                            <p class="buy_sell_text text-right">Sell <span>57.0%</span></p>
                                                        </div>
                                                    </div>
                                                </div>


                                                <div class="tab-pane fade" id="recent_trade">
                                                    <div class="order_book_table_block">
                                                        <table class="order_book_table">
                                                            <thead>
                                                                <tr>
                                                                    <th>Price USDT</th>
                                                                    <th>Quantity (BTC)</th>
                                                                    <th>Timestamp</th>
                                                                </tr>
                                                            </thead>
                                                            <br />
                                                            <tbody class="mt-4">
                                                                <tr >
                                                                    <td class="text-green">94,555.00</td>
                                                                    <td>0.0005689</td>
                                                                    <td>14.10:00</td>
                                                                </tr>
                                                                <tr>
                                                                    <td class="text-red">93,555.00</td>
                                                                    <td>0.0005689</td>
                                                                    <td>14.10:00</td>
                                                                </tr>
                                                                <tr>
                                                                    <td class="text-red">94,555.07</td>
                                                                    <td>0.0005689</td>
                                                                    <td>14.10:00</td>
                                                                </tr>
                                                                <tr>
                                                                    <td class="text-red">94,555.08</td>
                                                                    <td>0.0005689</td>
                                                                    <td>14.10:00</td>
                                                                </tr>
                                                                <tr>
                                                                    <td class="text-red">94,555.03</td>
                                                                    <td>0.0005689</td>
                                                                    <td>14.10:00</td>
                                                                </tr>
                                                                <tr>
                                                                    <td class="text-green">94,555.01</td>
                                                                    <td>0.0005689</td>
                                                                    <td>14.10:00</td>
                                                                </tr>
                                                                <tr>
                                                                    <td class="text-red">93,777.00</td>
                                                                    <td>0.0005689</td>
                                                                    <td>14.10:00</td>
                                                                </tr>
                                                                <tr>
                                                                    <td class="text-red">92,999.00</td>
                                                                    <td>0.0005689</td>
                                                                    <td>14.10:00</td>
                                                                </tr>
                                                                <tr>
                                                                    <td class="text-red">92,888.00</td>
                                                                    <td>0.0005689</td>
                                                                    <td>14.10:00</td>
                                                                </tr>
                                                                <tr>
                                                                    <td class="text-red">94,555.01</td>
                                                                    <td>0.0005689</td>
                                                                    <td>14.10:00</td>
                                                                </tr>
                                                                <tr>
                                                                    <td class="text-red">93,777.00</td>
                                                                    <td>0.0005689</td>
                                                                    <td>14.10:00</td>
                                                                </tr>

                                                                <tr>
                                                                    <td class="text-green">94,555.01</td>
                                                                    <td>0.0005689</td>
                                                                    <td>14.10:00</td>
                                                                </tr>
                                                                <tr>
                                                                    <td class="text-red">93,777.00</td>
                                                                    <td>0.0005689</td>
                                                                    <td>14.10:00</td>
                                                                </tr>
                                                                <tr>
                                                                    <td class="text-red">92,999.00</td>
                                                                    <td>0.0005689</td>
                                                                    <td>14.10:00</td>
                                                                </tr>
                                                                <tr>
                                                                    <td class="text-red">92,888.00</td>
                                                                    <td>0.0005689</td>
                                                                    <td>14.10:00</td>
                                                                </tr>
                                                                <tr>
                                                                    <td class="text-red">94,555.01</td>
                                                                    <td>0.0005689</td>
                                                                    <td>14.10:00</td>
                                                                </tr>
                                                                <tr>
                                                                    <td class="text-red">93,777.00</td>
                                                                    <td>0.0005689</td>
                                                                    <td>14.10:00</td>
                                                                </tr>
                                                                <tr>
                                                                    <td class="text-green">94,555.01</td>
                                                                    <td>0.0005689</td>
                                                                    <td>14.10:00</td>
                                                                </tr>
                                                                <tr>
                                                                    <td class="text-red">93,777.00</td>
                                                                    <td>0.0005689</td>
                                                                    <td>14.10:00</td>
                                                                </tr>
                                                                <tr>
                                                                    <td class="text-red">92,999.00</td>
                                                                    <td>0.0005689</td>
                                                                    <td>14.10:00</td>
                                                                </tr>
                                                                <tr class="mt-2">
                                                                    <td class="text-red">92,888.00</td>
                                                                    <td>0.0005689</td>
                                                                    <td>14.10:00</td>
                                                                </tr>
                                                                <tr class="mt-2">
                                                                    <td class="text-red">94,555.01</td>
                                                                    <td>0.0005689</td>
                                                                    <td>14.10:00</td>
                                                                </tr>
                                                                <tr class="mt-2">
                                                                    <td class="text-red">93,777.00</td>
                                                                    <td>0.0005689</td>
                                                                    <td>14.10:00</td>
                                                                </tr>

                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col form_sidebar_col">
                            <div class="trade_section">
                                <h4 class="trade_heading">Trade</h4>
                                <div class="trade_tabs_section">
                                    <ul class="nav nav-pills">
                                        <li class="nav-item">
                                            <a class="nav-link active btn-green" data-bs-toggle="pill" href="#buy_trade">
                                                Buy
                                            </a>
                                        </li>
                                        <li class="nav-item">
                                            <a class="nav-link" data-bs-toggle="pill" href="#sell_trade">
                                                Sell
                                            </a>
                                        </li>
                                    </ul>
                                    <div class="tab-content">
                                        <div class="tab-pane active" id="buy_trade">
                                            <form class="trade_form_block">
                                                <div class="trade_row">
                                                    <div class="trade_label">
                                                        <span>Available Balance</span>
                                                        <span>--USDT</span>
                                                    </div>
                                                    <div class="trade_input_rows">
                                                            <div class="trade_input_rows">
                                                <div class="form-floating">
                                                    <input type="text" class="form-control number_input" id="trade_buy_balance" name="trade_buy_balance" value={balance} placeholder="Price" />
                                                    <label for="trade_buy_balance">Price</label>
                                                </div>
                                               <img src="https://iosandweb.com/markets/assests/images/logo.png" alt=""  style={{height:"20px",marginTop:"10px",}}/>
                                            </div>
                                                    </div>
                                                </div>
                                                
                                                <div class="trade_row">
                                                    <div class="trade_input_rows p-2">
                                                        <div class="form-floating">
                                                             <input
                                                                type="text"
                                                                placeholder={isSwapped ? "You Get" : "Your Send"}
                                                                value={isSwapped ? calculatedReceiveAmount : sendAmount}
                                                                readOnly={isSwapped}
                                                                onChange={isSwapped ? undefined : (e) => setSendAmount(e.target.value)}
                                                                id="trade_buy_balance"
                                                                name="trade_buy_balance" 
                                                                className="outline-none"/>
                                                            {/* <label for="trade_buy_balance">Quantity</label> */}
                                                        </div>
                                                        <div class="trade-right-form">
                                                               <div
                                                            className="sm align-items-center"
                                                            onClick={() => isSwapped ? setShowReceiveModal(true) : setShowSendModal(true)}
                                                            style={{ cursor: "pointer" }}
                                                        >
                                                            {(isSwapped ? selectedCoin1 : selectedCoin) ? (
                                                                <>
                                                                    <img
                                                                        src={(isSwapped ? selectedCoin1.image : selectedCoin.image)} $nbsp
                                                                        alt={(isSwapped ? selectedCoin1.name : selectedCoin.name)}
                                                                        width={17}
                                                                        height={17}
                                                                        style={{ marginRight: "4px" }}
                                                                    />
                                                                    <span style={{ whiteSpace: "nowrap",margin:"2px" }}>
                                                                        <span>{(isSwapped ? selectedCoin1.symbol : selectedCoin.symbol).toUpperCase()}</span> &nbsp;<SlArrowDown style={{ fontSize: "10px" }} /> <br />
                                                                        <span style={{ fontSize: "15px", }}>
                                                                            {(isSwapped ? selectedCoin1.name : selectedCoin.name)} </span>
                                                                        (
                                                                        {(isSwapped ? selectedCoin1.symbol : selectedCoin.symbol).toUpperCase()})
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                null
                                                            )}
                                                        </div>
                                                        </div>
                                                    </div>
                                                </div>
                                        
                                                <div class="trade_row">
                                                    <div class="trade_input_rows p-2">
                                                        <div class="form-floating">
                                                            <input type="number"
                                                                placeholder={isSwapped ? "Your Send" : "You Get"}
                                                                value={isSwapped ? sendAmount : calculatedReceiveAmount}
                                                                readOnly={!isSwapped}
                                                                onChange={isSwapped ? (e) => setSendAmount(e.target.value) : undefined}
                                                                style={{ boxShadow: "none", backgroundColor: "transparent" }} id="trade_buy_order" name="trade_buy_order"
                                                                 className="outline-none"
                                                                 />
                                                            {/* <label for="trade_buy_order">Order Value</label> */}
                                                        </div>
                                                        <div class="trade-right-form">

                                                            <div
                                                                className="sm align-items-center"
                                                                onClick={() => isSwapped ? setShowSendModal(true) : setShowReceiveModal(true)}
                                                                style={{ cursor: "pointer" }}
                                                            >
                                                                {(isSwapped ? selectedCoin : selectedCoin1) ? (
                                                                    <>

                                                                        <img
                                                                            src={(isSwapped ? selectedCoin.image : selectedCoin1.image)}
                                                                            alt={(isSwapped ? selectedCoin.name : selectedCoin1.name)}
                                                                            width={17}
                                                                            height={17}
                                                                            style={{ marginRight: "4px" }}
                                                                        />

                                                                        <span style={{ whiteSpace: "nowrap",margin:"2px"}}>

                                                                            <span>{(isSwapped ? selectedCoin.symbol : selectedCoin1.symbol).toUpperCase()}&nbsp;<SlArrowDown style={{ fontSize: "10px" }} /> </span><br />
                                                                            <span style={{ fontSize: "15px", }}>
                                                                                {(isSwapped ? selectedCoin.name : selectedCoin1.name)}
                                                                            </span> (
                                                                            {(isSwapped ? selectedCoin.symbol : selectedCoin1.symbol).toUpperCase()})

                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                    <span className="text-muted">
                                                                        {isSwapped ? "You send" : "You receive"} <IoIosArrowDown />
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="trade_label text-right">
                                                        <span>--USD</span>
                                                    </div>
                                                </div>

                                                <div class="trade_row">
                                                    <div class="trade_input_rows">
                                                        <div class="form-floating">
                                                            <input type="text"
                                                                value={ethAddress}
                                                                onChange={(e) => setEthAddress(e.target.value)}
                                                                style={{ boxShadow: "none", backgroundColor: "transparent" }} class="form-control number_input" id="trade_buy_max_amount" name="trade_buy_max_amount" placeholder="Ethereum address" />
                                                            <label for="trade_buy_max_amount">Ethereum address</label>
                                                        </div>
                                                        <div class="trade-right-form">
                                                            <p class="currency_form small-text">
                                                                <span>--BTC</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* <input type="submit"  value="Buy" 
                                                 
                                                /> */}


                                        {/* <input type="submit" class="btn-submit-form btn-green" value="Buy" onClick={() => handleExchange(account, uuid)} /> */}


                                            </form>
                                            <button className="btn-submit-form-tn-green" onClick={() => handleExchange(account, uuid)}>
                                                Transfer
                                            </button>

                                        </div>

                                        <div class="tab-pane fade" id="sell_trade">
                                            <form action="" method="post" class="trade_form_block">
                                                <div class="trade_row">
                                                    <div class="trade_label">
                                                        <span>Available Balance</span>
                                                        <span>--USDT</span>
                                                    </div>
                                                    <div class="trade_input_rows">
                                                        <div class="form-floating">
                                                            <input type="text" class="form-control number_input" id="trade_sell_balance" name="trade_sell_balance" value="94550.2" placeholder="Price" />
                                                            <label for="trade_sell_balance">Price</label>
                                                        </div>
                                                        <select name="trade_select_sell_currency" class="form-control form-right-select">
                                                            <option value="USDT">USDT</option>
                                                            <option value="BTC">BTC</option>
                                                            <option value="BNB">BNB</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div class="trade_row">
                                                    <div class="trade_input_rows">
                                                        <div class="form-floating">
                                                            <input type="text" class="form-control number_input" id="trade_sell_quantity" name="trade_sell_quantity" value="" placeholder="Quantity" />
                                                            <label for="trade_sell_quantity">Quantity</label>
                                                        </div>
                                                        <div class="trade-right-form">
                                                            <p class="currency_form">
                                                                <img src={redfullBitcoin} alt="Bitcoin" class="currency_icon" />
                                                                <span>BTC</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div class="trade_row">
                                                    <div class="trade_input_rows">
                                                        <div class="form-floating">
                                                            <input type="text" class="form-control number_input" id="trade_sell_order" name="trade_sell_order" value="" placeholder="Order Value" />
                                                            <label for="trade_sell_order">Order Value</label>
                                                        </div>
                                                        <div class="trade-right-form">
                                                            <p class="currency_form small-text">
                                                                <span>USDT</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div class="trade_label text-right">
                                                        <span>--USD</span>
                                                    </div>
                                                </div>

                                                <div class="trade_row">
                                                    <div class="trade_input_rows">
                                                        <div class="form-floating">
                                                            <input type="text" class="form-control number_input" id="trade_sell_max_amount" name="trade_sell_max_amount" value="" placeholder="Max. Buying Amount" />
                                                            <label for="trade_sell_max_amount">Max. Buying Amount</label>
                                                        </div>
                                                        <div class="trade-right-form">
                                                            <p class="currency_form small-text">
                                                                <span>--BTC</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <input type="submit" class="btn-submit-form btn-red" value="Sell" />

                                            </form>
                                        </div>
                                    </div>

                                    <div class="deposit_transfer">
                                        <button type="button" class="btn-primary-black">Deposit</button>
                                        <button type="button" class="btn-primary-black">Transfer</button>
                                    </div>
                                    <div class="deposit_transfer">

                                        <button type="button" class="btn-primary-black-btc">
                                            <div class="content">
                                                <div class="symbol">BTC3S</div>
                                                <div class="change positive">+2.04%</div>
                                            </div>
                                            <div class="arrow">&#8250;</div>
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-primary-black-btc"
                                            style={{
                                                background: 'linear-gradient(90deg,#ef454a47,#ef454a00),linear-gradient(270deg,#202124,#101014)',
                                            }}
                                        >


                                            <div class="content">
                                                <div class="symbol">BTC3L</div>
                                                <div class="change negative">-1.25%</div>
                                            </div>
                                            <div class="arrow">&#8250;</div>
                                        </button>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            <section class="orders_section section-padding-bottom">
                <div class="container-fluid">
                    <div class="row">
                        <div class="col p-0">
                            <div class="orders_block_main">
                                <div class="tabs_marks_block">
                                    <ul class="nav nav-pills">
                                        <li class="nav-item hide_menu_trade">
                                            <div class="trade_icon hide_login">
                                                <div class="trade_img">
                                                    <img src={redfullBitcoingraph} alt="graph" class="graph_icon" />
                                                </div>
                                                <p class="trade_text">Trade</p>
                                            </div>
                                        </li>
                                        <li class="nav-item">
                                            <a class="nav-link active" data-bs-toggle="pill" href="#open_order">Open Order (0)</a>
                                        </li>
                                        <li class="nav-item">
                                            <a class="nav-link" data-bs-toggle="pill" href="#positions">Positions (0)</a>
                                        </li>
                                        <li class="nav-item">
                                            <a class="nav-link" data-bs-toggle="pill" href="#order_history">Order History</a>
                                        </li>
                                        <li class="nav-item">
                                            <a class="nav-link" data-bs-toggle="pill" href="#trade_history">Trade History</a>
                                        </li>
                                        <li class="nav-item">
                                            <a class="nav-link" data-bs-toggle="pill" href="#assets_tab" >Assets</a>
                                        </li>
                                        <li class="nav-item">
                                            <a class="nav-link" data-bs-toggle="pill" href="#borrowing">Borrowing</a>
                                        </li>
                                        <li class="nav-item">
                                            <a class="nav-link" data-bs-toggle="pill" href="#tool_tab">Tool</a>
                                        </li>
                                        <li class="nav-item">
                                            <a class="nav-link" data-bs-toggle="pill" href="#pandl_tab">P&L</a>
                                        </li>
                                    </ul>

                                    <div className="markets_block">
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="markets_check"
                                                name="markets_check"
                                                value="markets"
                                                checked={isChecked}
                                                onChange={handleCheckboxChange}
                                            />
                                            <label className="form-check-label" htmlFor="markets_check">All Markets</label>
                                        </div>

                                        <select
                                            className="form-select"
                                            name="instruments"
                                            id="instruments"
                                            disabled={!isChecked}
                                        >
                                            <option value="All Instruments">All Instruments</option>
                                            <option value="Perpetual Only">Perpetual Only</option>
                                            <option value="Expiry Only">Expiry Only</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="tab-content">
                                    {/* <!-- Open Order Tab --> */}
                                    <div class="tab-pane active" id="open_order">
                                        <ul class="nav nav-pills sub_tab_links">
                                            <li class="nav-item">
                                                <a class="nav-link active" data-bs-toggle="pill" href="#limit_market_order">Limit & Market Order</a>
                                            </li>
                                            <li class="nav-item">
                                                <a class="nav-link" data-bs-toggle="pill" href="#conditional">Conditional</a>
                                            </li>
                                            <li class="nav-item">
                                                <a class="nav-link" data-bs-toggle="pill" href="#TPSL_tab">TP/SL</a>
                                            </li>
                                            <li class="nav-item">
                                                <a class="nav-link" data-bs-toggle="pill" href="#trailing_stop">Trailing Stop</a>
                                            </li>
                                            <li class="nav-item">
                                                <a class="nav-link" data-bs-toggle="pill" href="#OCO_tab">OCO</a>
                                            </li>
                                            <li class="nav-item">
                                                <a class="nav-link" data-bs-toggle="pill" href="#MMR_close">MMR Close</a>
                                            </li>
                                            <li class="nav-item">
                                                <a class="nav-link" data-bs-toggle="pill" href="#spread_trading">Spread Trading</a>
                                            </li>
                                        </ul>

                                        <div class="tab-content">
                                            {/* <!-- Limit market Order tab --> */}
                                            <div class="tab-pane sub_tab_content active" id="limit_market_order">
                                                <div class="table_block_div">
                                                    <table class="order_table_tab">
                                                        <thead>
                                                            <tr>
                                                                <th>Market</th>
                                                                <th>Instrument</th>
                                                                <th>Order type</th>
                                                                <th>Direction</th>
                                                                <th>Order Price</th>
                                                                <th>Filled / Order Quantity</th>
                                                                <th>Order Value</th>
                                                                <th>TP/SL</th>
                                                                <th>Trade Type</th>
                                                                <th>Order Time</th>
                                                                <th>Order ID</th>
                                                                <th>Reduce Only</th>
                                                                <th>Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody></tbody>
                                                    </table>
                                                    {walletInfo && walletInfo.account && walletInfo.balance ? (

                                                        <div class="no_data_found">
                                                            <img src="assests/images/no-data.png" alt="No data" class="no_data_icon" />
                                                            <p class="text-small">No Available Data</p>
                                                        </div>
                                                    ) : (
                                                        <div class="hide_login login_first_block">
                                                            <p class="login_first">
                                                                Please
                                                                &nbsp;     <a href="#" class="login_span">Log In</a>
                                                                &nbsp;      or &nbsp;
                                                                <a href="#" class="login_span">Sign Up</a>
                                                                &nbsp;   first.
                                                            </p>
                                                        </div>
                                                    )}

                                                </div>
                                            </div>

                                            {/* <!-- Conditional tab --> */}
                                            <div class="tab-pane sub_tab_content" id="conditional">
                                                <div class="table_block_div">
                                                    <table class="order_table_tab">
                                                        <thead>
                                                            <tr>
                                                                <th>Market</th>
                                                                <th>Instrument</th>
                                                                <th>Direction</th>
                                                                <th>Trigger Price</th>
                                                                <th>Order Price</th>
                                                                <th>Order Qty</th>
                                                                <th>Order Value</th>
                                                                <th>TP/SL</th>
                                                                <th>Trade Type</th>
                                                                <th>Order Time</th>
                                                                <th>Order ID</th>
                                                                <th>Reduce Only</th>
                                                                <th>Order Status</th>
                                                                <th>Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody></tbody>
                                                    </table>
                                                    {walletInfo && walletInfo.account && walletInfo.balance ? (

                                                        <div class="no_data_found">
                                                            <img src="assests/images/no-data.png" alt="No data" class="no_data_icon" />
                                                            <p class="text-small">No Available Data</p>
                                                        </div>
                                                    ) : (
                                                        <div class="hide_login login_first_block">
                                                            <p class="login_first">
                                                                Please
                                                                &nbsp;     <a href="#" class="login_span">Log In</a>
                                                                &nbsp;      or &nbsp;
                                                                <a href="#" class="login_span">Sign Up</a>
                                                                &nbsp;   first.
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* <!-- TP/SL tab --> */}
                                            <div class="tab-pane sub_tab_content" id="TPSL_tab">
                                                <div class="table_block_div">
                                                    <table class="order_table_tab">
                                                        <thead>
                                                            <tr>
                                                                <th>Market</th>
                                                                <th>Instrument</th>
                                                                <th>Direction</th>
                                                                <th>Trigger Price</th>
                                                                <th>Order Price</th>
                                                                <th>Order Qty</th>
                                                                <th>Order Value</th>
                                                                <th>Trade Type</th>
                                                                <th>Order Time</th>
                                                                <th>Order ID</th>
                                                                <th>Order Status</th>
                                                                <th>Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody></tbody>
                                                    </table>
                                                    <div class="no_data_found">
                                                        <img src="assests/images/no-data.png" alt="No data" class="no_data_icon" />
                                                        <p class="text-small">No Available Data</p>
                                                    </div>
                                                    <div class="hide_login login_first_block">
                                                        <p class="login_first">
                                                            Please
                                                            <a href="#" class="login_span">Log In</a>
                                                            or
                                                            <a href="#" class="login_span">Sign Up</a>
                                                            first.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* <!-- Trailing Stop tab --> */}
                                            <div class="tab-pane sub_tab_content" id="trailing_stop">
                                                <div class="table_block_div">
                                                    <table class="order_table_tab">
                                                        <thead>
                                                            <tr>
                                                                <th>Market</th>
                                                                <th>Instrument</th>
                                                                <th>Direction</th>
                                                                <th>Trigger Price</th>
                                                                <th>Retracement</th>
                                                                <th>Activation Price</th>
                                                                <th>Order Price</th>
                                                                <th>Order Qty</th>
                                                                <th>Order Value</th>
                                                                <th>Trade Type</th>
                                                                <th>Order Time</th>
                                                                <th>Order ID</th>
                                                                <th>Order Status</th>
                                                                <th>Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody></tbody>
                                                    </table>
                                                    <div class="no_data_found">
                                                        <img src="assests/images/no-data.png" alt="No data" class="no_data_icon" />
                                                        <p class="text-small">No Available Data</p>
                                                    </div>
                                                    <div class="hide_login login_first_block">
                                                        <p class="login_first">
                                                            Please
                                                            <a href="#" class="login_span">Log In</a>
                                                            or
                                                            <a href="#" class="login_span">Sign Up</a>
                                                            first.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* <!-- OCO Tab --> */}
                                            <div class="tab-pane sub_tab_content" id="OCO_tab">
                                                <div class="table_block_div">
                                                    <table class="order_table_tab">
                                                        <thead>
                                                            <tr>
                                                                <th>Spot Pairs</th>
                                                                <th>Trade Type</th>
                                                                <th>Order Type</th>
                                                                <th>Direction</th>
                                                                <th>Order Value</th>
                                                                <th>Order Qty</th>
                                                                <th>TP/SL Order Price</th>
                                                                <th>TP/SL Trigger Price</th>
                                                                <th>Order Status</th>
                                                                <th>Order Time</th>
                                                                <th>Order ID</th>
                                                                <th>Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody></tbody>
                                                    </table>
                                                    <div class="no_data_found">
                                                        <img src="assests/images/no-data.png" alt="No data" class="no_data_icon" />
                                                        <p class="text-small">No Available Data</p>
                                                    </div>
                                                    <div class="hide_login login_first_block">
                                                        <p class="login_first">
                                                            Please
                                                            <a href="#" class="login_span">Log In</a>
                                                            or
                                                            <a href="#" class="login_span">Sign Up</a>
                                                            first.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* <!-- MMR Close --> */}
                                            <div class="tab-pane sub_tab_content" id="MMR_close">
                                                <div class="table_block_div">
                                                    <table class="order_table_tab">
                                                        <thead>
                                                            <tr>
                                                                <th>Market</th>
                                                                <th>Trigger MMR</th>
                                                                <th>Order Price</th>
                                                                <th>Order Qty</th>
                                                                <th>Trade Type</th>
                                                                <th>Order Time</th>
                                                                <th>Order ID</th>
                                                                <th>Order Status</th>
                                                                <th>Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody></tbody>
                                                    </table>
                                                    <div class="no_data_found">
                                                        <img src="assests/images/no-data.png" alt="No data" class="no_data_icon" />
                                                        <p class="text-small">No Available Data</p>
                                                    </div>
                                                    <div class="hide_login login_first_block">
                                                        <p class="login_first">
                                                            Please
                                                            <a href="#" class="login_span">Log In</a>
                                                            or
                                                            <a href="#" class="login_span">Sign Up</a>
                                                            first.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* <!-- Spread Trading tab --> */}
                                            <div class="tab-pane sub_tab_content" id="spread_trading">
                                                <div class="table_block_div">
                                                    <table class="order_table_tab">
                                                        <thead>
                                                            <tr>
                                                                <th>Symbol</th>
                                                                <th>Underlying</th>
                                                                <th>Strategy</th>
                                                                <th>Order Price</th>
                                                                <th>Filled/Order Quantity</th>
                                                                <th>Order Type</th>
                                                                <th>Order Status</th>
                                                                <th>Order ID</th>
                                                                <th>Order Time</th>
                                                                <th>Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody></tbody>
                                                    </table>
                                                    <div class="no_data_found">
                                                        <img src="assests/images/no-data.png" alt="No data" class="no_data_icon" />
                                                        <p class="text-small">No Available Data</p>
                                                    </div>
                                                    <div class="hide_login login_first_block">
                                                        <p class="login_first">
                                                            Please
                                                            <a href="#" class="login_span">Log In</a>
                                                            or
                                                            <a href="#" class="login_span">Sign Up</a>
                                                            first.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>

                                    {/* <!-- Positions Tab --> */}
                                    <div class="tab-pane" id="positions">
                                        <div class="table_block_div">
                                            <table class="order_table_tab">
                                                <thead>
                                                    <tr>
                                                        <th>Contracts</th>
                                                        <th>Qty</th>
                                                        <th>Value</th>
                                                        <th>Entry Price</th>
                                                        <th>Mark Price</th>
                                                        <th>Liq. Price</th>
                                                        <th>IM</th>
                                                        <th>MM</th>
                                                        <th>Unrealized P&L(ROI)</th>
                                                        <th>Realized P&L</th>
                                                        <th>TP/SL</th>
                                                        <th>Trailing Stop</th>
                                                        <th>ADL</th>
                                                        <th>MMR Close</th>
                                                        <th>Reverse Position</th>
                                                        <th>Close By</th>
                                                    </tr>
                                                </thead>
                                                <tbody></tbody>
                                            </table>
                                            <div class="no_data_found">
                                                <img src="assests/images/no-data.png" alt="No data" class="no_data_icon" />
                                                <p class="text-small">No Available Data</p>
                                            </div>
                                            <div class="hide_login login_first_block">
                                                <p class="login_first">
                                                    Please
                                                    <a href="#" class="login_span">Log In</a>
                                                    or
                                                    <a href="#" class="login_span">Sign Up</a>
                                                    first.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* <!-- Order History Tab --> */}
                                    <div class="tab-pane" id="order_history">
                                        <ul class="nav nav-pills sub_tab_links">
                                            <li class="nav-item">
                                                <a class="nav-link active" data-bs-toggle="pill" href="#limit_market_order_history">Limit & Market Order</a>
                                            </li>
                                            <li class="nav-item">
                                                <a class="nav-link" data-bs-toggle="pill" href="#conditional_history">Conditional</a>
                                            </li>
                                            <li class="nav-item">
                                                <a class="nav-link" data-bs-toggle="pill" href="#TPSL_tab_history">TP/SL</a>
                                            </li>
                                            <li class="nav-item">
                                                <a class="nav-link" data-bs-toggle="pill" href="#trailing_stop_history">Trailing Stop</a>
                                            </li>
                                            <li class="nav-item">
                                                <a class="nav-link" data-bs-toggle="pill" href="#OCO_tab_history">OCO</a>
                                            </li>
                                            <li class="nav-item">
                                                <a class="nav-link" data-bs-toggle="pill" href="#MMR_close_history">MMR Close</a>
                                            </li>
                                            <li class="nav-item">
                                                <a class="nav-link" data-bs-toggle="pill" href="#spread_trading_history">Spread Trading</a>
                                            </li>
                                        </ul>

                                        <div class="tab-content">
                                            {/* <!-- Limit market Order tab --> */}
                                            <div class="tab-pane sub_tab_content active" id="limit_market_order_history">
                                                <div class="table_block_div">
                                                    <table class="order_table_tab">
                                                        <thead>
                                                            <tr>
                                                                <th>Market</th>
                                                                <th>Instrument</th>
                                                                <th>Order type</th>
                                                                <th>Direction</th>
                                                                <th>Order Price</th>
                                                                <th>Filled / Order Quantity</th>
                                                                <th>Order Value</th>
                                                                <th>TP/SL</th>
                                                                <th>Trade Type</th>
                                                                <th>Order Time</th>
                                                                <th>Order ID</th>
                                                                <th>Reduce Only</th>
                                                                <th>Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody></tbody>
                                                    </table>
                                                    <div class="no_data_found">
                                                        <img src="assests/images/no-data.png" alt="No data" class="no_data_icon" />
                                                        <p class="text-small">No Available Data</p>
                                                    </div>
                                                    <div class="hide_login login_first_block">
                                                        <p class="login_first">
                                                            Please
                                                            <a href="#" class="login_span">Log In</a>
                                                            or
                                                            <a href="#" class="login_span">Sign Up</a>
                                                            first.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* <!-- Conditional tab --> */}
                                            <div class="tab-pane sub_tab_content" id="conditional_history">
                                                <div class="table_block_div">
                                                    <table class="order_table_tab">
                                                        <thead>
                                                            <tr>
                                                                <th>Market</th>
                                                                <th>Instrument</th>
                                                                <th>Direction</th>
                                                                <th>Trigger Price</th>
                                                                <th>Order Price</th>
                                                                <th>Order Qty</th>
                                                                <th>Order Value</th>
                                                                <th>TP/SL</th>
                                                                <th>Trade Type</th>
                                                                <th>Order Time</th>
                                                                <th>Order ID</th>
                                                                <th>Reduce Only</th>
                                                                <th>Order Status</th>
                                                                <th>Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody></tbody>
                                                    </table>
                                                    <div class="no_data_found">
                                                        <img src="assests/images/no-data.png" alt="No data" class="no_data_icon" />
                                                        <p class="text-small">No Available Data</p>
                                                    </div>
                                                    <div class="hide_login login_first_block">
                                                        <p class="login_first">
                                                            Please
                                                            <a href="#" class="login_span">Log In</a>
                                                            or
                                                            <a href="#" class="login_span">Sign Up</a>
                                                            first.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* <!-- TP/SL tab --> */}
                                            <div class="tab-pane sub_tab_content" id="TPSL_tab_history">
                                                <div class="table_block_div">
                                                    <table class="order_table_tab">
                                                        <thead>
                                                            <tr>
                                                                <th>Market</th>
                                                                <th>Instrument</th>
                                                                <th>Direction</th>
                                                                <th>Trigger Price</th>
                                                                <th>Order Price</th>
                                                                <th>Order Qty</th>
                                                                <th>Order Value</th>
                                                                <th>Trade Type</th>
                                                                <th>Order Time</th>
                                                                <th>Order ID</th>
                                                                <th>Order Status</th>
                                                                <th>Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody></tbody>
                                                    </table>
                                                    <div class="no_data_found">
                                                        <img src="assests/images/no-data.png" alt="No data" class="no_data_icon" />
                                                        <p class="text-small">No Available Data</p>
                                                    </div>
                                                    <div class="hide_login login_first_block">
                                                        <p class="login_first">
                                                            Please
                                                            <a href="#" class="login_span">Log In</a>
                                                            or
                                                            <a href="#" class="login_span">Sign Up</a>
                                                            first.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* <!-- Trailing Stop tab --> */}
                                            <div class="tab-pane sub_tab_content" id="trailing_stop_history">
                                                <div class="table_block_div">
                                                    <table class="order_table_tab">
                                                        <thead>
                                                            <tr>
                                                                <th>Market</th>
                                                                <th>Instrument</th>
                                                                <th>Direction</th>
                                                                <th>Trigger Price</th>
                                                                <th>Retracement</th>
                                                                <th>Activation Price</th>
                                                                <th>Order Price</th>
                                                                <th>Order Qty</th>
                                                                <th>Order Value</th>
                                                                <th>Trade Type</th>
                                                                <th>Order Time</th>
                                                                <th>Order ID</th>
                                                                <th>Order Status</th>
                                                                <th>Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody></tbody>
                                                    </table>
                                                    <div class="no_data_found">
                                                        <img src="assests/images/no-data.png" alt="No data" class="no_data_icon" />
                                                        <p class="text-small">No Available Data</p>
                                                    </div>
                                                    <div class="hide_login login_first_block">
                                                        <p class="login_first">
                                                            Please
                                                            <a href="#" class="login_span">Log In</a>
                                                            or
                                                            <a href="#" class="login_span">Sign Up</a>
                                                            first.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* <!-- OCO Tab --> */}
                                            <div class="tab-pane sub_tab_content" id="OCO_tab_history">
                                                <div class="table_block_div">
                                                    <table class="order_table_tab">
                                                        <thead>
                                                            <tr>
                                                                <th>Spot Pairs</th>
                                                                <th>Trade Type</th>
                                                                <th>Order Type</th>
                                                                <th>Direction</th>
                                                                <th>Order Value</th>
                                                                <th>Order Qty</th>
                                                                <th>TP/SL Order Price</th>
                                                                <th>TP/SL Trigger Price</th>
                                                                <th>Order Status</th>
                                                                <th>Order Time</th>
                                                                <th>Order ID</th>
                                                                <th>Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody></tbody>
                                                    </table>
                                                    <div class="no_data_found">
                                                        <img src="assests/images/no-data.png" alt="No data" class="no_data_icon" />
                                                        <p class="text-small">No Available Data</p>
                                                    </div>
                                                    <div class="hide_login login_first_block">
                                                        <p class="login_first">
                                                            Please
                                                            <a href="#" class="login_span">Log In</a>
                                                            or
                                                            <a href="#" class="login_span">Sign Up</a>
                                                            first.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* <!-- MMR Close --> */}
                                            <div class="tab-pane sub_tab_content" id="MMR_close_history">
                                                <div class="table_block_div">
                                                    <table class="order_table_tab">
                                                        <thead>
                                                            <tr>
                                                                <th>Market</th>
                                                                <th>Trigger MMR</th>
                                                                <th>Order Price</th>
                                                                <th>Order Qty</th>
                                                                <th>Trade Type</th>
                                                                <th>Order Time</th>
                                                                <th>Order ID</th>
                                                                <th>Order Status</th>
                                                                <th>Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody></tbody>
                                                    </table>
                                                    <div class="no_data_found">
                                                        <img src="assests/images/no-data.png" alt="No data" class="no_data_icon" />
                                                        <p class="text-small">No Available Data</p>
                                                    </div>
                                                    <div class="hide_login login_first_block">
                                                        <p class="login_first">
                                                            Please
                                                            <a href="#" class="login_span">Log In</a>
                                                            or
                                                            <a href="#" class="login_span">Sign Up</a>
                                                            first.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* <!-- Spread Trading tab --> */}
                                            <div class="tab-pane sub_tab_content" id="spread_trading_history">
                                                <div class="table_block_div">
                                                    <table class="order_table_tab">
                                                        <thead>
                                                            <tr>
                                                                <th>Symbol</th>
                                                                <th>Underlying</th>
                                                                <th>Strategy</th>
                                                                <th>Order Price</th>
                                                                <th>Filled/Order Quantity</th>
                                                                <th>Order Type</th>
                                                                <th>Order Status</th>
                                                                <th>Order ID</th>
                                                                <th>Order Time</th>
                                                                <th>Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody></tbody>
                                                    </table>
                                                    <div class="no_data_found">
                                                        <img src="assests/images/no-data.png" alt="No data" class="no_data_icon" />
                                                        <p class="text-small">No Available Data</p>
                                                    </div>
                                                    <div class="hide_login login_first_block">
                                                        <p class="login_first">
                                                            Please
                                                            <a href="#" class="login_span">Log In</a>
                                                            or
                                                            <a href="#" class="login_span">Sign Up</a>
                                                            first.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* <!-- Trade History Tab --> */}
                                    <div class="tab-pane" id="trade_history">
                                        <div class="table_block_div">
                                            <table class="order_table_tab">
                                                <thead>
                                                    <tr>
                                                        <th>Market</th>
                                                        <th>Instrument</th>
                                                        <th>Order Type</th>
                                                        <th>Direction</th>
                                                        <th>Filled Value</th>
                                                        <th>Filled Price</th>
                                                        <th>Filled Qty</th>
                                                        <th>Filled Type</th>
                                                        <th>Trading Fees</th>
                                                        <th>Transaction Time</th>
                                                        <th>Transaction Id</th>
                                                        <th>Impiled Volatility</th>
                                                        <th>Index Price</th>
                                                    </tr>
                                                </thead>
                                                <tbody></tbody>
                                            </table>
                                            <div class="no_data_found">
                                                <img src="assests/images/no-data.png" alt="No data" class="no_data_icon" />
                                                <p class="text-small">No Available Data</p>
                                            </div>
                                            <div class="hide_login login_first_block">
                                                <p class="login_first">
                                                    Please
                                                    <a href="#" class="login_span">Log In</a>
                                                    or
                                                    <a href="#" class="login_span">Sign Up</a>
                                                    first.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* <!-- Assets Tab --> */}
                                    <div class="tab-pane" id="assets_tab">
                                        <div class="table_block_div">
                                            <table class="order_table_tab">
                                                <thead>
                                                    <tr>
                                                        <th>Coins</th>
                                                        <th>Net Asset Value</th>
                                                        <th>Balance</th>
                                                        <th>Spot Cost</th>
                                                        <th>Last Price</th>
                                                        <th>PnL</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>
                                                            <div class="table_coins">
                                                                <img src={redfullBitcoin} alt="Bitcoin" class="table_coin_img" />
                                                                <span>BTC</span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <p class="text-small text-bold">0.00000000</p>
                                                            <p class="text-small text-gray">≈0.00 USD</p>
                                                        </td>
                                                        <td>
                                                            <p class="text-small text-bold">0.00000000</p>
                                                        </td>
                                                        <td>
                                                            <p class="text-small text-bold">--</p>
                                                        </td>
                                                        <td>
                                                            <p class="text-small text-bold">98836.40 USD</p>
                                                        </td>
                                                        <td>
                                                            <p class="text-small text-bold">--</p>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <div class="table_coins">
                                                                <img src="assests/images/usdt.svg" alt="USDt" class="table_coin_img" />
                                                                <span>BTC</span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <p class="text-small text-bold">0.0000</p>
                                                            <p class="text-small text-gray">≈0.00 USD</p>
                                                        </td>
                                                        <td>
                                                            <p class="text-small text-bold">0.0000</p>
                                                        </td>
                                                        <td>
                                                            <p class="text-small text-bold">--</p>
                                                        </td>
                                                        <td>
                                                            <p class="text-small text-bold">--</p>
                                                        </td>
                                                        <td>
                                                            <p class="text-small text-bold">--</p>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* <!-- Borrowing Tab --> */}
                                    <div class="tab-pane" id="borrowing">
                                        <div class="table_block_div">
                                            <table class="order_table_tab">
                                                <thead>
                                                    <tr>
                                                        <th>Coins</th>
                                                        <th>Borrowed Amount</th>
                                                        <th>Hourly Borrow Rate</th>
                                                        <th>Max. Borrowing Amount</th>
                                                        <th>Free Borrowing Amount</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody></tbody>
                                            </table>
                                            <div class="no_data_found">
                                                <img src="assests/images/no-data.png" alt="No data" class="no_data_icon" />
                                                <p class="text-small">No Available Data</p>
                                            </div>
                                            <div class="hide_login login_first_block">
                                                <p class="login_first">
                                                    Please
                                                    <a href="#" class="login_span">Log In</a>
                                                    or
                                                    <a href="#" class="login_span">Sign Up</a>
                                                    first.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* <!-- Tools Tab --> */}
                                    <div class="tab-pane" id="tool_tab">
                                        <ul class="nav nav-pills sub_tab_links">
                                            <li class="nav-item">
                                                <a class="nav-link active" data-bs-toggle="pill" href="#chase_tab">Chase</a>
                                            </li>
                                            <li class="nav-item">
                                                <a class="nav-link" data-bs-toggle="pill" href="#twap_tab">TWAP</a>
                                            </li>
                                            <li class="nav-item">
                                                <a class="nav-link" data-bs-toggle="pill" href="#iceberg_tab">Iceberg</a>
                                            </li>
                                            <li class="nav-item">
                                                <a class="nav-link" data-bs-toggle="pill" href="#webhook_tab">Webhook</a>
                                            </li>
                                        </ul>
                                        <div class="tab-content">
                                            {/* <!-- Chase tab --> */}
                                            <div class="tab-pane sub_tab_content active" id="chase_tab">
                                                <div class="table_block_div">
                                                    <table class="order_table_tab">
                                                        <thead>
                                                            <tr>
                                                                <th>Market</th>
                                                                <th>Instrument</th>
                                                                <th>Direction</th>
                                                                <th>Filled/Total</th>
                                                                <th>Avg. Filled Price</th>
                                                                <th>Max. Chasing Price</th>
                                                                <th>Chase Price</th>
                                                                <th>Reduce Only</th>
                                                                <th>Creation Time</th>
                                                                <th>Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody></tbody>
                                                    </table>
                                                    <div class="no_data_found">
                                                        <img src="assests/images/no-data.png" alt="No data" class="no_data_icon" />
                                                        <p class="text-small">No Available Data</p>
                                                    </div>
                                                    <div class="hide_login login_first_block">
                                                        <p class="login_first">
                                                            Please
                                                            <a href="#" class="login_span">Log In</a>
                                                            or
                                                            <a href="#" class="login_span">Sign Up</a>
                                                            first.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* <!-- TWAP tab --> */}
                                            <div class="tab-pane sub_tab_content" id="twap_tab">
                                                <div class="table_block_div">
                                                    <table class="order_table_tab">
                                                        <thead>
                                                            <tr>
                                                                <th>Market</th>
                                                                <th>Instrument</th>
                                                                <th>Direction</th>
                                                                <th>Avg. Filled Price</th>
                                                                <th>Price Limit</th>
                                                                <th>Filled/Total</th>
                                                                <th>Reduce Only</th>
                                                                <th>Status</th>
                                                                <th>Frequency</th>
                                                                <th>Running Time/Total</th>
                                                                <th>Creation Time</th>
                                                                <th>Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody></tbody>
                                                    </table>
                                                    <div class="no_data_found">
                                                        <img src="assests/images/no-data.png" alt="No data" class="no_data_icon" />
                                                        <p class="text-small">No Available Data</p>
                                                    </div>
                                                    <div class="hide_login login_first_block">
                                                        <p class="login_first">
                                                            Please
                                                            <a href="#" class="login_span">Log In</a>
                                                            or
                                                            <a href="#" class="login_span">Sign Up</a>
                                                            first.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* <!-- Iceberg tab --> */}
                                            <div class="tab-pane sub_tab_content" id="iceberg_tab">
                                                <div class="table_block_div">
                                                    <table class="order_table_tab">
                                                        <thead>
                                                            <tr>
                                                                <th>Market</th>
                                                                <th>Instrument</th>
                                                                <th>Direction</th>
                                                                <th>Avg. Filled Price/Order Price</th>
                                                                <th>Price Limit</th>
                                                                <th>Filled/Order Quantity</th>
                                                                <th>Reduce Only</th>
                                                                <th>Order Preferences</th>
                                                                <th>Creation Time</th>
                                                                <th>Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody></tbody>
                                                    </table>
                                                    <div class="no_data_found">
                                                        <img src="assests/images/no-data.png" alt="No data" class="no_data_icon" />
                                                        <p class="text-small">No Available Data</p>
                                                    </div>
                                                    <div class="hide_login login_first_block">
                                                        <p class="login_first">
                                                            Please
                                                            <a href="#" class="login_span">Log In</a>
                                                            or
                                                            <a href="#" class="login_span">Sign Up</a>
                                                            first.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* <!-- Webhook tab --> */}
                                            <div class="tab-pane sub_tab_content" id="webhook_tab">
                                                <div class="table_block_div">
                                                    <table class="order_table_tab">
                                                        <thead>
                                                            <tr>
                                                                <th>Market</th>
                                                                <th>Signal Name</th>
                                                                <th>Trigger(s)/Trade(s)</th>
                                                                <th>Status</th>
                                                                <th>Realized P/L</th>
                                                                <th>Creation Time</th>
                                                                <th>Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody></tbody>
                                                    </table>
                                                    <div class="no_data_found">
                                                        <img src="assests/images/no-data.png" alt="No data" class="no_data_icon" />
                                                        <p class="text-small">No Available Data</p>
                                                    </div>
                                                    <div class="hide_login login_first_block">
                                                        <p class="login_first">
                                                            Please
                                                            <a href="#" class="login_span">Log In</a>
                                                            or
                                                            <a href="#" class="login_span">Sign Up</a>
                                                            first.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                    {/* <!-- P&L Tab --> */}
                                    <div class="tab-pane" id="pandl_tab">
                                        <ul class="nav nav-pills sub_tab_links">
                                            <li class="nav-item">
                                                <a class="nav-link active" data-bs-toggle="pill" href="#closed_orders">Closed orders</a>
                                            </li>
                                            <li class="nav-item">
                                                <a class="nav-link" data-bs-toggle="pill" href="#closed_positions">Closed Positions</a>
                                            </li>
                                        </ul>

                                        <div class="tab-content">
                                            {/* <!-- Closed orders tab --> */}
                                            <div class="tab-pane sub_tab_content active" id="closed_orders">
                                                <div class="table_block_div">
                                                    <table class="order_table_tab">
                                                        <thead>
                                                            <tr>
                                                                <th>Market</th>
                                                                <th>Instrument</th>
                                                                <th>Entry Price</th>
                                                                <th>Traded Price</th>
                                                                <th>Order Quantity</th>
                                                                <th>Trade Type</th>
                                                                <th>Realized P/L</th>
                                                                <th>Opening Fee</th>
                                                                <th>Closing Fee</th>
                                                                <th>Funding Fee</th>
                                                                <th>Trade Time</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody></tbody>
                                                    </table>
                                                    walletInfo
                                                    <div class="no_data_found">
                                                        <img src="assests/images/no-data.png" alt="No data" class="no_data_icon" />
                                                        <p class="text-small">No Available Data</p>
                                                    </div>
                                                    <div class="hide_login login_first_block">
                                                        <p class="login_first">
                                                            Please
                                                            <a href="#" class="login_span">Log In</a>
                                                            or
                                                            <a href="#" class="login_span">Sign Up</a>
                                                            first.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* <!-- Closed Positions tab --> */}
                                            <div class="tab-pane sub_tab_content" id="closed_positions">
                                                <div class="table_block_div">
                                                    <table class="order_table_tab">
                                                        <thead>
                                                            <tr>
                                                                <th>Market</th>
                                                                <th>Instrument</th>
                                                                <th>Direction</th>
                                                                <th>Avg. Entry Price</th>
                                                                <th>Avg. Exit Price</th>
                                                                <th>Qty</th>
                                                                <th>P&L</th>
                                                                <th>Opening Fee</th>
                                                                <th>Closing Fee</th>
                                                                <th>Funding Fee</th>
                                                                <th>Open Time</th>
                                                                <th>Open Duration</th>
                                                                <th>Close Time</th>
                                                                <th>Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody></tbody>
                                                    </table>
                                                    <div class="no_data_found">
                                                        <img src="assests/images/no-data.png" alt="No data" class="no_data_icon" />
                                                        <p class="text-small">No Available Data</p>
                                                    </div>
                                                    <div class="hide_login login_first_block">
                                                        <p class="login_first">
                                                            Please
                                                            <a href="#" class="login_span">Log In</a>
                                                            or
                                                            <a href="#" class="login_span">Sign Up</a>
                                                            first.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>

                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>



                    <Modal show={showSendModal} onHide={() => setShowSendModal(false)}>
                        <Modal.Header closeButton>
                            <HiArrowLeft className="fs-5" onClick={() => setShowSendModal(false)} />
                            &nbsp; &nbsp;&nbsp; &nbsp; &nbsp;&nbsp;
                            <Modal.Title style={{ fontSize: "17px" }}>Select a currency</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="show-modal">
                            <div className="search-wrapper px-2">
                                <input
                                    type="text"
                                    placeholder="Search currency"
                                    value={searchSend}
                                    onChange={(e) => setSearchSend(e.target.value)}
                                    className="search-input"
                                />
                                <span className="search-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" class="cursor-pointer"><path fill="#B4B6B8" fill-rule="evenodd" d="M5 11c0-3.309 2.691-6 6-6s6 2.691 6 6-2.691 6-6 6-6-2.691-6-6m15.707 8.293-3.395-3.396A7.95 7.95 0 0 0 19 11c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8a7.95 7.95 0 0 0 4.897-1.688l3.396 3.395a.997.997 0 0 0 1.414 0 1 1 0 0 0 0-1.414" clip-rule="evenodd"></path></svg>
                                </span>
                            </div>
                            <div style={{ maxHeight: "450px", overflowY: "auto" }}>
                                {filteredSendList.map((coin) => (
                                    <div
                                        key={coin.id}
                                        className="d-flex justify-content-between align-items-center p-2 border-bottoms"
                                        onClick={() => handleCoinSelect(coin)}
                                    >
                                        <div className="d-flex align-items-center gap-3">
                                            <img src={coin.image} alt={coin.name} width={32} height={32} />
                                            <div>
                                                <strong>{coin.name}</strong> ({coin.symbol.toUpperCase()})
                                            </div>
                                        </div>
                                        <div className="text-end">
                                            <div>${coin.current_price.toLocaleString()}</div>
                                            <small className="text-muted">
                                                MCap: ${coin.market_cap.toLocaleString()}
                                            </small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Modal.Body>
                        {/* <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSendModal(false)}>
            Close
          </Button>
        </Modal.Footer> */}
                    </Modal>
                    {/* Modal for "You Receive" */}
                    <Modal show={showReceiveModal} onHide={() => setShowReceiveModal(false)}>
                        <Modal.Header closeButton>
                            <HiArrowLeft className="fs-5" onClick={() => setShowSendModal(false)} />
                            &nbsp; &nbsp;&nbsp; &nbsp; &nbsp;&nbsp;
                            <Modal.Title style={{ fontSize: "17px" }}>Select a currency</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="show-modal">
                            <div className="search-wrapper py-3">
                                <input
                                    type="text"
                                    placeholder="Search currency"
                                    value={searchSend}
                                    onChange={(e) => setSearchSend(e.target.value)}
                                    className="search-input"
                                />
                                <span className="search-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" class="cursor-pointer"><path fill="#B4B6B8" fill-rule="evenodd" d="M5 11c0-3.309 2.691-6 6-6s6 2.691 6 6-2.691 6-6 6-6-2.691-6-6m15.707 8.293-3.395-3.396A7.95 7.95 0 0 0 19 11c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8a7.95 7.95 0 0 0 4.897-1.688l3.396 3.395a.997.997 0 0 0 1.414 0 1 1 0 0 0 0-1.414" clip-rule="evenodd"></path></svg>

                                </span>
                            </div>
                            <div style={{ maxHeight: "450px", overflowY: "auto" }}>
                                {filteredReceiveList.map((coin) => (
                                    <div
                                        key={coin.id}
                                        className="d-flex justify-content-between align-items-center p-2 border-bottoms"
                                        onClick={() => handleCoinSelect1(coin)}   >
                                        <div className="d-flex align-items-center gap-3">
                                            <img src={coin.image} alt={coin.name} width={32} height={32} />
                                            <div>
                                                <strong>{coin.name}</strong> ({coin.symbol.toUpperCase()})
                                            </div>
                                        </div>
                                        <div className="text-end">
                                            <div>${coin.current_price.toLocaleString()}</div>
                                            <small className="text-muted">
                                                MCap: ${coin.market_cap.toLocaleString()}
                                            </small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Modal.Body>
                        {/* <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReceiveModal(false)}>
            Close
          </Button>
        </Modal.Footer> */}
                    </Modal>
                </div>


                <ToastContainer
                    position="top-center"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick={false}
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                />
            </section>
        </>
    )
}
export default Trade;
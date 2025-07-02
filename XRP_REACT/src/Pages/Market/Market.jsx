import { Tab } from "bootstrap";
import { Tabs } from "react-bootstrap";
import TrendingBlock from "../../Components/TrendingBlock/TrendingBlock";
import TableBlock from "../../Components/TableBlock/TableBlock";

// import Pagination from 'react-bootstrap/Pagination';
const overview_graph = `${process.env.REACT_APP_API_IMAGES_PATH}/images/overview_graph.png`;
const arrows = `${process.env.REACT_APP_API_IMAGES_PATH}/images/arrows.png`;
const graph_black = `${process.env.REACT_APP_API_IMAGES_PATH}/images/graph_black.png`;
const graph_green = `${process.env.REACT_APP_API_IMAGES_PATH}/images/graph_green.png`;

const Market = () => {
    return (
        <>
            <section className="overview_section section-padding-overview">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12">
                            <ul className="navbar-nav overview_nav">
                                <li className="nav-item">
                                    <a className="nav-link active" href="/markets">Overview</a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" href="/markets">Keymetrics</a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" href="/markets">Contact Data</a>
                                </li>
                            </ul>
                        </div>
                        <div className="col-12">
                            <div className="graph_market_block">
                                <div className="graph_market_block_col">
                                    <div className="market_block_head">
                                        <p className="market_block_heading">Market Sentiment</p>
                                    </div>
                                    <div className="market_block_body text-center">
                                        <img src={overview_graph} alt="Graph" className="overview_graph" />
                                    </div>
                                </div>

                                <div className="graph_market_block_col">
                                    <div className="market_block_head">
                                        <p className="market_block_heading">Market Data</p>
                                    </div>
                                    <div className="market_block_body">
                                        <div className="market_data_div">
                                            <div className="market_data_col_left">
                                                <p className="market_data_text">Current ETH Gas Price</p>
                                                <p className="market_data_amount">
                                                    <span className="text-white">0.545620185 Gwei </span>
                                                    <img className="arrows_market" src={arrows} alt="arrows" />
                                                    <span className="text-gray">0.021 USD</span>
                                                </p>
                                            </div>
                                            <img src={graph_black} className="graph_market_data" alt="graph" />
                                        </div>
                                        <div className="market_data_div">
                                            <div className="market_data_col_left">
                                                <p className="market_data_text">Trading Vol.</p>
                                                <p className="market_data_amount">
                                                    <span className="text-green">18.27% </span>
                                                    <span className="text-white">1190.36 B USDT </span>
                                                </p>
                                            </div>
                                            <img src={graph_green} className="graph_market_data" alt="graph" />
                                        </div>
                                    </div>
                                </div>

                                <div className="graph_market_block_col">
                                    <div className="market_block_head">
                                        <p className="market_block_heading">Trending Sectors</p>
                                    </div>
                                    <div className="market_block_body">
                                        <div className="market_trading_data">
                                            <p className="trading_heading">Fan Token</p>
                                            <p className="trading_text text-green">2.79%</p>
                                            <p className="trading_small_text">CITY <span className="text-green">4.68%</span></p>
                                        </div>
                                        <div className="market_trading_data">
                                            <p className="trading_heading">Wallet</p>
                                            <p className="trading_text text-green">1.18%</p>
                                            <p className="trading_small_text">LRC <span className="text-green">13.35%</span></p>
                                        </div>
                                        <div className="market_trading_data">
                                            <p className="trading_heading">HK Concept</p>
                                            <p className="trading_text text-green">0.94%</p>
                                            <p className="trading_small_text">LRC <span className="text-green">13.58%</span></p>
                                        </div>
                                        <div className="market_trading_data">
                                            <p className="trading_heading">Rollups</p>
                                            <p className="trading_text text-red">-0.58%</p>
                                            <p className="trading_small_text">LRC <span className="text-red">14.21%</span></p>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* Markets table section */}
            <section className="markets_table_section section-padding-overview">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col">
                            <div className="markets_table_block">
                                <div className="markets_heading_block">
                                    <h4 className="markets_heading">Markets</h4>
                                </div>

                                <div className="markets_table_tabs_block">
                                    <Tabs
                                        defaultActiveKey="spot_tab"
                                        id="table_tabs"
                                        className="markets_table_tabs"
                                        variant="pills"
                                    >
                                        {/* Favorites */}
                                        <Tab eventKey="favorites" title="Favorites">
                                            <TrendingBlock />

                                            <TableBlock />
                                        </Tab>

                                        {/* Spot Tab */}
                                        <Tab eventKey="spot_tab" title="Spot">
                                            <TrendingBlock />

                                            {/* Spot table */}
                                            <TableBlock />

                                        </Tab>

                                        {/* Derivatives tab */}
                                        <Tab eventKey="derivatives" title="Derivatives">
                                            <TrendingBlock />

                                            <TableBlock />
                                        </Tab>

                                        {/* Newly Listed */}
                                        <Tab eventKey="newly_listed" title="Newly Listed">
                                            <TrendingBlock />

                                            <TableBlock />
                                        </Tab>
                                    </Tabs>

                                </div>
                            </div>
                        
                        </div>
                    </div>
                </div>
            </section>

            {/* <div className="pagination_block section-padding-overview">
                <Pagination className='justify-content-end'>
                    <Pagination.Prev />
                    <Pagination.Item active>{1}</Pagination.Item>
                    <Pagination.Item>{2}</Pagination.Item>
                    <Pagination.Item>{3}</Pagination.Item>
                    <Pagination.Item>{4}</Pagination.Item>
                    <Pagination.Item>{5}</Pagination.Item>
                    <Pagination.Ellipsis className='custom_icon' />
                    <Pagination.Item>{32}</Pagination.Item>
                    <Pagination.Next />
                </Pagination>
            </div> */}
        </>
        
    )
}

export default Market
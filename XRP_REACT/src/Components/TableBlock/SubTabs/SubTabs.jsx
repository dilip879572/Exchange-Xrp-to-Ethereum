import { Tab } from "bootstrap";
import { Tabs } from "react-bootstrap";
import TrendingTable from "../TrendingTable/TrendingTable";
import { useRef } from "react";

const SubTabs = () => {
  const navRef = useRef(null);
  let isDragging = false;
  let startX;
  let scrollLeft;

  const handleMouseDown = (e) => {
    isDragging = true;
    navRef.current.classList.add("dragging");
    startX = e.pageX - navRef.current.offsetLeft;
    scrollLeft = navRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDragging = false;
    navRef.current.classList.remove("dragging");
  };

  const handleMouseUp = () => {
    isDragging = false;
    navRef.current.classList.remove("dragging");
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - navRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    navRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    navRef.current.scrollLeft += e.deltaY;
  };

  return (
    <div className="scrollable-tabs-nav">
      <Tabs
        defaultActiveKey="all_sub_tab"
        id="sub_tab_links"
        variant="pills"
        className="sub_tab_links"
        ref={navRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
      >
        <Tab eventKey="all_sub_tab" title="All">
          <TrendingTable />
        </Tab>

        <Tab eventKey="fees_tab" title="0 Fees">
          <TrendingTable />
        </Tab>

        <Tab eventKey="margin_trading" title="Margin Trading">
          <TrendingTable />
        </Tab>

        <Tab eventKey="adventure_zone" title="Adventure Zone">
          <TrendingTable />
        </Tab>

        <Tab eventKey="SOL_ecosystem" title="SOL Ecosystem">
          <TrendingTable />
        </Tab>

        <Tab eventKey="ETH_ecosystem" title="ETH Ecosystem">
          <TrendingTable />
        </Tab>

        <Tab eventKey="BTC_ecosystem" title="BTC Ecosystem">
          <TrendingTable />
        </Tab>

        <Tab eventKey="AI_tab" title="AI">
          <TrendingTable />
        </Tab>

        <Tab eventKey="modular-BCs" title="Modular-BCs">
          <TrendingTable />
        </Tab>

        <Tab eventKey="DePIN_tab" title="DePIN">
          <TrendingTable />
        </Tab>

        <Tab eventKey="LSD_tab" title="LSD">
          <TrendingTable />
        </Tab>

        <Tab eventKey="DeFi_tab" title="DeFi">
          <TrendingTable />
        </Tab>

        <Tab eventKey="GameFi_tab" title="GameFi">
          <TrendingTable />
        </Tab>

        <Tab eventKey="Inscriptions_tab" title="Inscriptions">
          <TrendingTable />
        </Tab>

        <Tab eventKey="Meme_tab" title="Meme">
          <TrendingTable />
        </Tab>

        <Tab eventKey="PoW_tab" title="PoW">
          <TrendingTable />
        </Tab>

        <Tab eventKey="Stablecoin_tab" title="Stablecoin">
          <TrendingTable />
        </Tab>

        <Tab eventKey="ETP_tab" title="ETP (Leveraged Tokens)">
          <TrendingTable />
        </Tab>

        <Tab eventKey="Launchpool_tab" title="Launchpool">
          <TrendingTable />
        </Tab>

        <Tab eventKey="Launchpad_tab" title="Launchpad">
          <TrendingTable />
        </Tab>
      </Tabs>
    </div>
  );
};

export default SubTabs;

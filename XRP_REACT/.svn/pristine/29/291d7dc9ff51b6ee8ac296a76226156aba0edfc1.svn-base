import { Tab } from "bootstrap";
import { Tabs } from "react-bootstrap";
import SubTabs from "./SubTabs/SubTabs";
import { useRef } from "react";

const TableBlock = () => {

  const blockRef = useRef(null);
  let isDragging = false;
  let startX;
  let scrollLeft;

  const handleMouseDown = (e) => {
    isDragging = true;
    blockRef.current.classList.add("dragging");
    startX = e.pageX - blockRef.current.offsetLeft;
    scrollLeft = blockRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDragging = false;
    blockRef.current.classList.remove("dragging");
  };

  const handleMouseUp = () => {
    isDragging = false;
    blockRef.current.classList.remove("dragging");
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - blockRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    blockRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    blockRef.current.scrollLeft += e.deltaY;
  };

  return (
    <div className="orders_block_main">
      <div className="tabs_marks_block_div">
        <Tabs
          defaultActiveKey="all_tab"
          id="table_sub_tabs"
          variant="pills"
          className="tabs_marks_block"
          ref={blockRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onWheel={handleWheel}
        >
          {/* Favorites */}
          <Tab eventKey="all_tab" title="All">
            <SubTabs />
          </Tab>

          <Tab eventKey="USDT_tab" title="USDT">
            <SubTabs />
          </Tab>

          <Tab eventKey="USDC_tab" title="USDC">
            <SubTabs />
          </Tab>

          <Tab eventKey="USDE_tab" title="USDE">
            <SubTabs />
          </Tab>

          <Tab eventKey="EUR_tab" title="EUR">
            <SubTabs />
          </Tab>

          <Tab eventKey="BRL_tab" title="BRL">
            <SubTabs />
          </Tab>

          <Tab eventKey="PLN_tab" title="PLN">
            <SubTabs />
          </Tab>

          <Tab eventKey="TRY_tab" title="TRY">
            <SubTabs />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
};

export default TableBlock;

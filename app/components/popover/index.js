import React, { useEffect, useState, useRef, useCallback } from 'react';
import { debunce } from '@util/util';
import './index.css';

export default function Popover({
  className = '',
  children = '',
  content = ''
}) {
  const [style, setStyle] = useState([]);
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);
  const childRef = useRef(null);
  function calcPosition() {
    console.log('-----');
    if (!wrapperRef.current) {
      return;
    }
    setTimeout(() => {
      const {
        left,
        top,
        height
      } = wrapperRef.current.getBoundingClientRect();
      setStyle({
        left: `${left - $(contentRef.current).width() + $(childRef.current).width() + 21}px`,
        top: `${top + height}px`
      });
      // console.log({
      //   left: `${left - $(contentRef.current).width() + $(childRef.current).width() + 21}px`,
      //   top: `${top + height}px`
      // });
    }, 500);
  }
  useEffect(() => {
    calcPosition();
  }, []);
  console.log('--111---');
  const throttleCalcPosition = useCallback(debunce(calcPosition));
  // $(window).resize(function () {
  //   throttleCalcPosition();
  // });
  $('#root').scroll(function () {
    throttleCalcPosition();
  });
  return (
    <div ref={wrapperRef}
      className={`Popover_Wrapper flex ${className}`}>
      <div ref={childRef}
        className="Popover_Wrapper_Child flex">{children}</div>
      <div className="Popover_Wrapper_Box animated">
        <div ref={contentRef}
          className="Popover_Wrapper_Content"
          style={style}>
          {content}
        </div>
      </div>
    </div>
  );
};
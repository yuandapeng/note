import React from 'react';
import Icon from '../icon/icon.js';
import './index.css';

export default function RecentContent(props) {
  const { book = {}, title = '', updated_at = '', user = {} } = props.data;
  return (
    <div className="Recent_Content">
      <div className="Recent_Content_Left">
        <Icon type="file-text" />
        <div className="Recent_Content_Left_Info">
          <p>{title}</p>
          <span>{`${user.name} / ${book.name}`}</span>
          <span>{updated_at} 编辑了文档</span>
        </div>
      </div>
      <div className="Recent_Content_Right">
        <div className="Recent_Content_Item">
          <Icon type="edit" />
        </div>
        <div className="Recent_Content_Item Recent_Content_Item_More">
          <Icon type="ellipsis" />
        </div>
      </div>
    </div>
  );
};
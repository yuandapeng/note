import React, { useEffect } from 'react';
import Header from '@components/header/header';
import SiderBarLayout from '@components/sider-bar/index';
import TableHeader from '@components/table-header';
import Footer from '@components/footer';
import Table from '@common/table';
import axiosInstance from '@util/axiosInstance';
import './index.css';

export default function Docs() {
  const columns = [{
    title: '名称',
    key: 'name',
    dataIndex: 'name',
    render: text => <a>{text}</a>
  }, {
    title: '标签',
    key: 'status',
    dataIndex: 'status',
    render: text => <a>{text}</a>
  }, {
    title: '简介',
    key: 'belong',
    dataIndex: 'belong',
    render: text => <a>{text}</a>
  }, {
    title: '操作',
    key: 'action',
    dataIndex: 'action',
    render: text => <a>{text}</a>
  }];
  async function fetchSpaces () {
    const [error, data] = await axiosInstance.get();
    console.log(error, data);
  }
  useEffect(() => {
    fetchSpaces();
  }, []);
  const dataSource = [{
    key: '1',
    name: 'John Brown',
    status: 0,
    belong: 'FUCK ME',
    action: ['nice', 'developer']
  }, {
    key: '2',
    name: 'TAOME',
    status: 0,
    belong: 'FUCK ME 1',
    action: ['nice', 'developer']
  }, {
    key: '3',
    name: 'John Brown22',
    status: 0,
    belong: 'FUCK ME2',
    action: ['nice', 'developer']
  }];
  return (
    <div className="Container">
      <Header />
      <div className="Content_Wrapper_Index">
        <SiderBarLayout />
        <div className="Space_Content">
          <TableHeader />
          <Table className="Space_Table"
            columns={columns}
            dataSource={dataSource} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
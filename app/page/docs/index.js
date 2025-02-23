import React, { useEffect, useState } from 'react';
import Header from '@components/header/header';
import SiderBarLayout from '@components/sider-bar/index';
import TableHeader from '@components/table-header';
import Footer from '@components/footer';
import Popover from '@components/popover';
import Table from '@common/table';
import Empty from '@common/empty';
import Tag from '@common/tag';
import List from '@common/list';
import Icon from '@common/icon';
import Modal from '@common/modal';
import useMessage from '@hooks/use-message';
import axiosInstance from '@util/axiosInstance';
import { Link, useHistory } from 'react-router-dom';
import { formatTimeStamp } from '@util/util';
import './index.css';

const message = useMessage();

// 下拉选项
function renderDocOperation(onOperationClick, docInfo) {
  return (
    <List className="Docs_operations"
      onTap={onOperationClick}
      list={[{
        text: '删除',
        key: 'delete',
        docInfo
      }, {
        text: '复制',
        key: 'copy',
        docInfo
      }, {
        text: '使用该模版创建',
        key: 'template',
        docInfo
      }]} />);
}
// 恢复文档
async function onRecovery(info, history) {
  const { doc_id, space: { space_id } } = info;
  const [error, data] = await axiosInstance.post('/doc/update', {
    status: '1',
    doc_id
  });
  if (!error && data && data.STATUS === 'OK') {
    history.push(`/article/${doc_id}?spaceId=${space_id}`);
  } else {
    message.error({ content: '系统开小差啦，请稍后再试' });
    console.log('[恢复文档失败] ', error);
  }
}
// 右侧操作项
function renderRightJsx(info, handle, h, deleteDoc) {
  if (info.status === '0') {
    return (<div className="Doc_Action">
      <span
        onClick={() => { onRecovery(info, h); }}
        style={{ color: 'rgb(37, 184, 100)', marginRight: '10px' }}>恢复</span>
      <span onClick={() => { deleteDoc('thorough'); }}>彻底删除</span>
    </div>);
  }
  if (info.title_draft || info.markdown_draft) {
    return <Link to={`/editor/${info.doc_id}?spaceId=${info.space_id}`}>去更新</Link>;
  }
  return <div className="flex">
    <Link to={'/editor' + info.url.split('article')[1]}>编辑</Link>
    <Popover content={renderDocOperation(handle, info)}>
      <Icon type="ellipsis"
        className="Space_Operation_Icon" />
    </Popover>
  </div>;
}
export default function Space() {
  const [dataSource, setDataSource] = useState([]);
  const [visible, setVisible] = useState(false);
  const [docInfo, setDocInfo] = useState(false);
  const history = useHistory();
  const columns = [{
    title: '名称',
    key: 'title'
  }, {
    title: '状态',
    key: 'status',
    render: (info) => {
      if (info.status === '0') {
        return <Tag color="rgb(255, 85, 0)">已删除</Tag>;
      }
      if (!info.markdown_draft && !info.title_draft) {
        return <Tag color="#25b864">已更新</Tag>;
      }
      return <Tag>未更新</Tag>;
    }
  }, {
    title: '归属',
    key: 'space',
    render: (info) => info.space.name
  }, {
    title: '最后编辑',
    key: 'updated_at',
    render: (info) => {
      return formatTimeStamp(info.updated_at);
    }
  }, {
    title: '编辑',
    key: 'url',
    render: (info) => {
      return renderRightJsx(info, onOperationClick, history, deleteDoc);
    }
  }];
  // 获取文档列表
  async function fetchDocs(type = 'ALL', q = '') {
    const [error, data] = await axiosInstance.get(`docs?q=${q}&type=${type.toLocaleLowerCase()}`);
    if (!error && data && Array.isArray(data) && data.length > 0) {
      setDataSource(data);
    } else {
      console.log('[获取文档列表失败] ', error);
    }
  }
  // 删除文档
  async function deleteDoc(type = '') {
    const docId = docInfo.doc_id;
    const params = {
      u: '/doc/update',
      p: { status: '0', doc_id: docId }
    };
    if (type === 'thorough') {
      params.u = 'doc/delete';
      params.p = { doc_id: docId };
    }
    const [error, data] = await axiosInstance.post(params.u, params.p);
    if (!error && data && data.STATUS === 'OK') {
      setDataSource(dataSource.map(n => {
        if (n.doc_id === docId) {
          n.status = '0';
        }
        return n;
      }));
    } else {
      message.error({ content: '系统开小差啦，请稍后重试' });
      console.log('[获取文档列表失败] ', error);
    }
  }
  function onOperationClick(e) {
    const { key, docInfo } = e;
    if (key === 'delete') {
      setVisible(true);
      setDocInfo(docInfo);
    }
  }
  function onTypeChange(type, info) {
    // 切换最近编辑/我创建的
    if (type === 'TYPE_CHANGE') {
      fetchDocs(info.code);
    }
    // 搜索
    if (type === 'SEARCH_CHANGE') {
      fetchDocs(info.code, info.q);
    }
  }
  function filterDataSource(d) {
    return d;
    // return d.filter(n => n.status !== '0');
  }
  useEffect(() => {
    fetchDocs();
  }, []);
  const onCancelModal = () => {
    setVisible(false);
  };
  const onConfirmModal = () => {
    deleteDoc();
    setVisible(false);
  };
  return (
    <div className="Container">
      <Header />
      <div className="Content_Wrapper_Index">
        <SiderBarLayout />
        <div className="Space_Content">
          <TableHeader onSomeThingClick={onTypeChange} />
          {dataSource.length === 0
            ? < Empty style={{ borderTop: 'none' }} />
            : <Table
              dataSourceKey={'id'}
              className="Space_Table"
              columns={columns}
              dataSource={filterDataSource(dataSource)} />}
        </div>
      </div>
      <Footer />
      <Modal
        subTitle="确认移动该文档到回收站？"
        title="移到回收站"
        onCancel={onCancelModal}
        onConfirm={onConfirmModal}
        confirmText="确认删除"
        visible={visible} >
        移动到回收站后，可在左下角【回收站】进行恢复
      </Modal>
    </div>
  );
}
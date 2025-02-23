import React, { useState, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';
import Input from '@common/input';
import Icon from '@common/icon';
import Button from '@common/button';
import axiosInstance from '@util/axiosInstance';
import { getIn, parseUrlQuery } from '@util/util';
import userContext from '@context/user/userContext';
import useMessage from '@hooks/use-message';
import './index.css';

export default function Login() {
  // TODO 如果从注册切到登陆时returnUrl的问题
  const message = useMessage();
  const isLoginPage = window.location.pathname === '/login';
  const { returnUrl = '' } = parseUrlQuery();
  const [state, setState] = useState({ account: '', password: '' });
  const [errorInfo, setErrorInfo] = useState({
    accountErrorMsg: '',
    passwordErrorMsg: ''
  });
  const history = useHistory();
  const { updateUserInfo } = useContext(userContext);
  // 1. 空值提示
  // 2. 格式不对提示
  // 3. 取服务端返回的错误-服务端需要区分帐号/密码
  const onChange = (type, e) => {
    setState({
      ...state,
      [`${type}`]: e.currentTarget.value
    });
  };
  // 验证用户输入
  const onVerifyInput = ({ account, password }) => {
    const errorInfo = {};
    if (!account || account.length < 5) {
      errorInfo.accountErrorMsg = '请输入正确帐号格式，至少 5 位';
    }
    if (!password || password.length < 6) {
      errorInfo.passwordErrorMsg = '请输入正确密码格式，至少 6 位';
    }
    setErrorInfo(errorInfo);
    return errorInfo.passwordErrorMsg || errorInfo.accountErrorMsg;
  };
  // 提交表单
  const onSubmit = async () => {
    const path = isLoginPage ? 'login' : 'register';
    const verifyNotPass = onVerifyInput(state);
    if (verifyNotPass) {
      return;
    }
    const [error, data] = await axiosInstance.post(path, state);
    if (!error && getIn(data, ['uuid'])) {
      updateUserInfo(data);
      // 登陆页回跳原来页面，注册页回跳首页
      if (isLoginPage && returnUrl) {
        const { pathname, search } = new URL(decodeURIComponent(returnUrl));
        history.replace(pathname + search);
      } else {
        history.replace('/');
      }
    } else {
      handleError(error);
    }
  };
  const handleError = (error) => {
    const code = getIn(error, ['code']);
    const content = getIn(error, ['message'], '系统开小差了，请稍后再试');
    const errorInfo = {};
    console.log(`[${isLoginPage ? '登陆' : '注册'}失败] `, error);
    if (code === 20003) {
      // 帐号不存在
      errorInfo.accountErrorMsg = content;
    } else if (code === 20004) {
      // 密码错误
      errorInfo.passwordErrorMsg = content;
    } else {
      message.error({ content });
    }
    setErrorInfo(errorInfo);
  };
  return (
    <div className="Login_Wrapper">
      <img
        src="https://pic4.zhimg.com/v2-a026c6cf35d9c35765d6af1f9101b74e.jpeg"
        alt=""
        className="Login_logo" />
      <h1 className="Login_title">一日一记</h1>
      <h2 className="Login_sub_title">工欲善其事，必先利其器</h2>
      <Input
        onChange={(e) => { onChange('account', e); }}
        addonBefore={<Icon type="user" />} />
      {errorInfo.accountErrorMsg && (
        <span className="Login_Error">{errorInfo.accountErrorMsg}</span>
      )}
      <Input
        addonBefore={<Icon type="lock" />}
        onChange={(e) => { onChange('password', e); }}
        type="password" />
      {errorInfo.passwordErrorMsg && (
        <span className="Login_Error">{errorInfo.passwordErrorMsg}</span>
      )}
      <Button
        type="primary"
        className="Login_submit"
        onClick={onSubmit}>
        {isLoginPage ? '立即登陆' : '立即注册'}
      </Button>
      <Link
        className="Login_action"
        to={isLoginPage ? '/register' : '/login'}>
        {isLoginPage ? '立即注册' : '立即登陆'}
      </Link>
      <span className="Login_Tips">
        一定要记住你的帐号哟，忘记了可是没办法找回来的。
      </span>
    </div>
  );
};
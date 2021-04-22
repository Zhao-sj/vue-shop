<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="" />
      </div>
      <!-- 表单区域
            :model 表单数据绑定
            :rules 表单验证规则 :prop 绑定验证规则
       -->
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" class="login_form">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input prefix-icon="iconfont icon-ziyuan" v-model="loginForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input type="password" prefix-icon="iconfont icon-mima" v-model="loginForm.password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="login_btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginForm: {
          username: '',
          password: ''
      },
      // 自定义验证规则
      loginFormRules: {
          username: [
              {required: true, message: '请输入用户名', trigger: 'blur'},
              { min: 4, max: 8, message: '长度在 4 到 8 个字符', trigger: 'blur' }
          ],
          password: [
              {required: true, message: '请输入密码', trigger: 'blur'}
          ]
      }
    };
  },
  methods: {
      // 表单重置
      reset() {
          this.$refs.loginFormRef.resetFields();
      },
      login() {
          this.$refs.loginFormRef.validate(async valid => {
              if (!valid) return;
              const { data: result } = await this.$axios.post('/login', this.loginForm);
              // const { data: result } = await this.$axios.post('/user/login', this.loginForm);
              if (result.status != 200) return this.$message.error(result.msg);
              this.$message.success('登录成功');
              window.sessionStorage.setItem('token', result.data.token);
              this.$router.push('/home');
          });
      }
  }
};
</script>

<style lang="less" scoped>
.login_container {
  height: 100%;
  background-color: #dee1e6;
  .login_box {
    width: 450px;
    height: 300px;
    position: absolute;
    top: 25%;
    left: 50%;
    transform: translate(-50%);
    background-color: #fff;
    border-radius: 10px;
    .login_form {
        width: 100%;
        position: absolute;
        bottom: 0;
        box-sizing: border-box;
        padding: 1rem;
        .login_btns {
            display: flex;
            justify-content: flex-end;
        }
    }
    .avatar_box {
      width: 8rem;
      height: 8rem;
      border: 1px solid #eee;
      border-radius: 50%;
      padding: 0.5rem;
      box-shadow: 0 0 0.5rem #ddd;
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #fff;
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
      }
    }
  }
}
</style>>
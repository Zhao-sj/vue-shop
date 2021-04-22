<template>
  <div class="home-header">
    <div>
      <img src="../assets/logo.png" alt="" />
      <span>电商后台管理系统</span>
    </div>
    <el-button type="info" @click="logout">退出</el-button>
  </div>
</template>

<script>
export default {
  methods: {
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
  },
};
</script>

<style lang="less" scoped>
.home-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  > div {
    display: flex;
    align-items: center;

    img {
      width: 60px;
      height: 60px;
    }

    span {
      color: #fff;
      font-size: 1.3rem;
      margin-left: 1rem;
    }
  }
}
</style>
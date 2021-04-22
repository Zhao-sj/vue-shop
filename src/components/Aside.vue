<template>
    <div class="home-aside-menu" :style="`width: ${isCollapse ? '64px' : '200px'}`">
        <!-- 收起菜单 -->
        <div class="menu-collapse" @click="toggleCollapse">|||</div>
        <el-menu background-color="#333744" text-color="#fff" unique-opened :collapse="isCollapse" :collapse-transition="false" router :default-active="activePath">
            <!-- 一级菜单 -->
            <el-submenu :index="menu.path" v-for="menu in menuList" :key="menu.id">
            <template slot="title">
                <i :class="iconsMapping[menu.id]"></i>
                <span>{{menu.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="menuitem.path" v-for="menuitem in menu.children" :key="menuitem.id" @click="saveActiveStatus(menuitem.path)">
                <i :class="iconsMapping[menuitem.id]"></i>
                <span>{{menuitem.authName}}</span>
            </el-menu-item>
            </el-submenu>
        </el-menu>
    </div>
</template>

<script>
export default {
  created() {
    this.getMenuList();
    this.activePath = window.sessionStorage.getItem('menuactivestatus');
  },
  data() {
    return {
        // 当前激活路径
        activePath: '',
        // 菜单是否折叠收起
        isCollapse: false,
        menuList: [],
        // 根据菜单id映射对应的icon
        iconsMapping: {
            // 一级菜单
            '125': 'iconfont icon-user-group',
            '103': 'iconfont icon-lifangti',
            '101': 'iconfont icon-shangpinchuangjian',
            '102': 'iconfont icon-danju-tianchong',
            '145': 'iconfont icon-baobiao',
            // 二级菜单
            '110': 'iconfont icon-user-list',
            '111': 'iconfont icon-jiaoseliebiao',
            '112': 'iconfont icon-quanxianliebiao',
            '104': 'iconfont icon-sp-list',
            '115': 'iconfont icon-canshu',
            '121': 'iconfont icon-shangpinfenlei',
            '107': 'iconfont icon-dingdanliebiao',
            '146': 'iconfont icon-shujubaobiao'
        }
    }
  },
  methods: {
      // 获取菜单列表
      async getMenuList() {
          const { data: result } = await this.$axios.get("/menus");
          if (result.status != 200) return this.$message.error(result.msg);
          this.menuList = result.data;
      },
      // 切换折叠
      toggleCollapse() {
          this.isCollapse = !this.isCollapse;
      },
      // 保存激活路由状态
      saveActiveStatus(path) {
          window.sessionStorage.setItem('menuactivestatus', path);
          this.activePath = path;
      }
  }
};
</script>

<style lang="less" scoped>
.home-aside-menu {
    width: 200px;
    transition: width .3s;

    .menu-collapse {
        height: 24px;
        text-align: center;
        color: #fff;
        line-height: 1.2em;
        background-color: #485164;
        cursor: pointer;
        letter-spacing: 3px;
    }

    .iconfont{
        margin-right: 10px;
    }
    
    .el-menu {
        border-right: none;
    }
}

.el-menu-item i {
    margin-right: 10px;
}
</style>
<template>
  <div class="home-users">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addUserDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userList" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <!-- 使用作用域插槽 显示用户状态 -->
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStatusChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="175px">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialogVisible(scope.row.id)"></el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeUserById(scope.row.id)"></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                <el-button type="warning" size="mini" icon="el-icon-setting" @click="showSetRoleDialog(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" width="50%" :visible.sync="addUserDialogVisible" @close="addUserDialogClosed">
        <!-- 添加用户表单区域 -->
        <el-form label-width="65px" :model="addUserForm" :rules="addUserFormRules" ref="addUserFormRef" status-icon>
            <el-form-item label="用户名" prop="username">
                <el-input v-model="addUserForm.username"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
                <el-input v-model="addUserForm.password"></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
                <el-input v-model="addUserForm.email"></el-input>
            </el-form-item>
            <el-form-item label="手机" prop="mobile">
                <el-input v-model="addUserForm.mobile"></el-input>
            </el-form-item>
        </el-form>
        <!-- 对话框按钮区域 -->
        <span slot="footer">
            <el-button type="primary" @click="addUser">确定</el-button>
            <el-button @click="addUserDialogVisible = false">取消</el-button>
        </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" width="50%" :visible.sync="editUserDialogVisible"  @close="editUserDialogClosed">
      <!-- 修改用户表单区域 -->
      <el-form label-width="65px" :model="editUserForm" :rules="addUserFormRules" ref="editUserFormRef" status-icon>
        <el-form-item label="用户名">
            <el-input v-model="editUserForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
            <el-input v-model="editUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
            <el-input v-model="editUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框按钮区域 -->
      <span slot="footer">
          <el-button type="primary" @click="editUserInfo">确定</el-button>
          <el-button @click="editUserDialogVisible = false">取消</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog title="角色分配" width="50%" :visible.sync="setRoleDialogVisible" @close="setRoleDialogClosed">
      <!-- 分配角色信息展示区域 -->
      <div class="assing-role">
        <el-row>
          <el-col :span="5">当前用户：</el-col>
          <el-col :span="19" v-text="userInfoByAssignRole.username"></el-col>
        </el-row>
        <el-row>
          <el-col :span="5">当前角色：</el-col>
          <el-col :span="19" v-text="userInfoByAssignRole.role_name"></el-col>
        </el-row>
        <el-row>
          <el-col :span="5">分配角色：</el-col>
          <el-col :span="19">
            <el-select v-model="assignRoleId" placeholder="请选择">
              <el-option v-for="item in roleList" :key="item.id" :label="item.roleName" :value="item.id"></el-option>
            </el-select>
          </el-col>
        </el-row>
      </div>
      <span slot="footer">
        <el-button type="primary" @click="setRole">确定</el-button>
        <el-button @click="setRoleDialogVisible = false">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getUserList();
  },
  data() {
    let checkEmail = (rule, value, callback) => {
        // 邮箱验证规则
        const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
        if (!regEmail.test(value)) return callback(new Error('请输入正确的邮箱'));
        callback();
    }
    let checkMobile = (rule, value, callback) => {
        // 手机验证规则
        const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
        if (!regMobile.test(value)) return callback(new Error('请输入正确的手机号'));
        callback();
    }
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 5,
      },
      userList: [],
      total: 0,
      // 控制添加用户对话框显示与隐藏
      addUserDialogVisible: false,
      // 控制用户修改对话框显示与隐藏
      editUserDialogVisible: false,
      // 添加用户表单数据
      addUserForm: {
          username: '',
          password: '',
          email: '',
          mobile: ''
      },
      // 添加用户验证规则
      addUserFormRules: {
          username: [
              { required: true, message: '请输入用户名', trigger: 'blur' },
              { min: 4, max: 8, message: '长度在 4 到 8 个字符', trigger: 'blur' }
          ],
          password: [
              { required: true, message: '请输入密码', trigger: 'blur' }
          ],
          email: [
              { required: true, message: '请输入邮箱', trigger: 'blur' },
              // 自定义效验规则
              { validator: checkEmail, trigger: 'blur' }
          ],
          mobile: [
              { required: true, message: '请输入手机号', trigger: 'blur' },
              { validator: checkMobile, trigger: 'blur' }
          ]
      },
      // 修改用户表单数据
      editUserForm: {},
      setRoleDialogVisible: false,
      // 保存用户信息,在分配角色展示
      userInfoByAssignRole: {},
      roleList: [],
      assignRoleId: ''
    };
  },
  methods: {
    // 获取用户列表
    async getUserList() {
      const { data: res } = await this.$axios.get("/users", {
        params: this.queryInfo,
      });
      if (res.status != 200) return this.$message.error(res.msg);
      this.userList = res.data.users;
      this.total = res.data.total;
    },
    // 监听 pagesize 改变
    handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize;
        this.getUserList();
    },
    // 监听页码值改变
    handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage;
        this.getUserList();
    },
    // 更新用户状态
    async userStatusChanged(userinfo) {
        const { data: res } = await this.$axios.put(`/users/${userinfo.id}/state/${userinfo.mg_state}`);
        if (res.status != 200) {
            userinfo.mg_state = !userinfo.mg_state;
            return this.$message.error(res.msg);
        }
        this.$message.success('更新用户状态成功！');
    },
    // 监听添加用户对话框关闭事件
    addUserDialogClosed() {
        // 对整个表单进行重置，将所有字段值重置为初始值并移除校验结果
        this.$refs.addUserFormRef.resetFields();
    },
    // 添加用户
    addUser() {
        this.$refs.addUserFormRef.validate(async validate => {
            if (!validate) return;
            const {data: res} = await this.$axios.post('/users', this.addUserForm);
            if (res.status != 201) return this.$message.error('添加用户失败！'); 
            this.$message.success('添加成功');
            this.addUserDialogVisible = false;
            this.getUserList();
        });
    },
    // 监听修改用户对话框显示
    async showEditDialogVisible(id) {
      const { data: res } = await this.$axios.get(`/users/${id}`);
      if (res.status != 200) return this.$message.error('获取用户数据失败！');
      this.editUserForm = res.data;
      this.editUserDialogVisible = true;
    },
    // 监听修改用户对话框关闭事件
    editUserDialogClosed() {
      this.$refs.editUserFormRef.resetFields();
    },
    // 修改用户数据
    editUserInfo() {
      this.$refs.editUserFormRef.validate(async validate => {
        if (!validate) return;
        const { data: res } = await this.$axios.put(`/users/${this.editUserForm.id}`, {
          email: this.editUserForm.email,
          mobile: this.editUserForm.mobile
        });
        if (res.status != 200) return this.$message.error('更新用户数据失败！');
        this.$message.success('更新成功');
        this.editUserDialogVisible = false;
        this.getUserList();
      });
    },
    // 删除用户操作
    async removeUserById(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err);
      if (confirmResult != 'confirm') return;
      const { data: res } = await this.$axios.delete(`/users/${id}`);
      if (res.status != 200) return this.$message.error(res.msg);
      this.$message.success('删除成功');
      this.getUserList();
    },
    async showSetRoleDialog(userInfo) {
      this.userInfoByAssignRole = userInfo;
      const { data: res } = await this.$axios.get('/roles');
      if (res.status != 200) return this.$message.error('获取角色列表失败！');
      this.roleList = res.data;
      this.setRoleDialogVisible = true;
    },
    setRoleDialogClosed() {
      this.assignRoleId = '';
    },
    // 分配角色
    async setRole() {
      if (!this.assignRoleId) return this.$message.warning('请选择要分配的角色！');
      const { data: res} = await this.$axios.put(`/users/${this.userInfoByAssignRole.id}/role`, {
        rid: this.assignRoleId
      });
      if (res.status != 200) return this.$message.error(res.msg);
      this.$message.success('更新用户角色成功');
      this.getUserList();
      this.setRoleDialogVisible = false;
    }
  },
};
</script>

<style lang="less" scoped>
.assing-role {
  .el-row {
    margin-bottom: 10px;
    line-height: 40px;
    .el-col:first-child {
      font-weight: bold;
    }
  }
}
</style>
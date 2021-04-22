<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
        <!-- 添加角色按钮区域 -->
        <el-row>
            <el-col>
                <el-button type="primary" @click="openAddRolesDialog">添加角色</el-button>
            </el-col>
        </el-row>
        <!-- 表格视图区域 -->
        <el-table :data="rolesList" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-row :class="['b-bottom', 'v-center', index1 == 0 ? 'b-top' : '']" v-for="(item1, index1) in scope.row.children" :key="item1.id">
                  <!-- 渲染一级权限 -->
                  <el-col :span="5">
                    <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 渲染二级和三级权限 -->
                  <el-col :span="19">
                    <el-row :class="['v-center', index2 == 0 ? '' : 'b-top']" v-for="(item2, index2) in item1.children" :key="item2.id">
                      <!-- 渲染二级权限 -->
                      <el-col :span="5">
                        <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{item2.authName}}</el-tag>
                        <i class="el-icon-caret-right"></i>
                      </el-col>
                      <!-- 渲染三级权限 -->
                      <el-col :span="19">
                        <el-tag type="danger" v-for="item3 in item2.children" :key="item3.id" closable @close="removeRightById(scope.row, item3.id)">{{item3.authName}}</el-tag>
                      </el-col>
                    </el-row>
                  </el-col>
                </el-row>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="角色名称" prop="roleName"></el-table-column>
            <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
            <el-table-column label="操作" width="285px">
                <template slot-scope="scope">
                    <el-button size="mini" type="primary" icon="el-icon-edit" @click="openEditRolesDialog(scope.row)">编辑</el-button>
                    <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeRoles(scope.row)">删除</el-button>
                    <el-button size="mini" type="warning" icon="el-icon-setting" @click="openAllotRightDialog(scope.row)">分配权限</el-button>
                </template>
            </el-table-column>
        </el-table>
    </el-card>
    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="addRolesDialogVisible" width="50%" @close="addRolesDialogClosed">
      <!-- 表单区域 -->
      <el-form label-width="80px" :model="addRolesForm" :rules="addRolesRules" ref="addRolesRef">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button type="primary" @click="addRoles">添加</el-button>
        <el-button @click="addRolesDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色对话框 -->
    <el-dialog title="角色修改" width="50%" :visible.sync="editRolesDialogVisible" @close="editRolesDialogClosed">
      <el-form label-width="80px" :model="editRolesForm" :rules="addRolesRules" ref="editRolesRef">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRolesForm.roleName" :placeholder="editRolesPlaceholder.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRolesForm.roleDesc" :placeholder="editRolesPlaceholder.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button type="primary" @click="editRoles">修改</el-button>
        <el-button @click="editRolesDialogVisible = false">取消</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" width="50%" :visible.sync="allotRightDialogVisible" @close="allotRightDialogClosed">
      <!-- 树形控件 -->
      <el-tree :data="rightList" :props="rightProps" show-checkbox node-key="id" :default-checked-keys="defaultChecked" ref="treeRef"></el-tree>
      <span slot="footer">
        <el-button type="primary" @click="allotRight">确定</el-button>
        <el-button @click="allotRightDialogVisible = false">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
      this.getRolesList();
  },
  data() {
    return {
        rolesList: [],
        addRolesDialogVisible: false,
        editRolesDialogVisible: false,
        allotRightDialogVisible: false,
        // 添加角色表单数据
        addRolesForm: {
          roleName: '',
          roleDesc: ''
        },
        // 添加角色表单验证规则
        addRolesRules: {
          roleName: [
            { required: true, message: '请输入角色名称', trigger: 'blur' },
          ],
          roleDesc: [
            { required: true, message: '请输入角色描述', trigger: 'blur' },
          ]
        },
        editRolesForm: {
          roleName: '',
          roleDesc: ''
        },
        editRolesPlaceholder: {},
        // 所有权限树形结构列表
        rightList: [],
        rightProps: {
          label: 'authName',
          children: 'children'
        },
        // 树形结构默认选中节点id
        defaultChecked: [],
        // 分配角色id
        allotRightId: ''
    };
  },
  methods: {
      async getRolesList() {
          const { data: res } = await this.$axios.get('/roles');
          if (res.status != 200) return this.$message.error(res.msg);
          this.rolesList = res.data;
      },
      async removeRightById(role, rightId) {
        const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '删除权限', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err);
        if (confirmResult != 'confirm') return;
        
        const { data: res } = await this.$axios.delete(`roles/${role.id}/rights/${rightId}`);
        if (res.status != 200) return this.$message.error('删除角色权限失败！');
        // 删除成功后返回该角色的最新权限，以赋值的方式更新数据，不用重新渲染表格
        role.children = res.data;
      },
      openAddRolesDialog() {
        this.addRolesDialogVisible = true;
      },
      // 关闭添加角色对话框后重置表单
      addRolesDialogClosed() {
        this.$refs.addRolesRef.resetFields();
      },
      addRoles() {
        this.$refs.addRolesRef.validate(async validate => {
          if (!validate) return;
          const { data: res } = await this.$axios.post('/roles', this.addRolesForm);
          if (res.status != 201) return this.$message.erroe('添加角色失败！');
          this.$message.success('添加成功');
          this.addRolesDialogVisible = false;
          this.getRolesList();
        });
      },
      openEditRolesDialog(rolesInfo) {
        this.editRolesPlaceholder = rolesInfo;
        this.editRolesDialogVisible = true;
      },
      editRolesDialogClosed() {
        this.$refs.editRolesRef.resetFields();
      },
      editRoles() {
        this.$refs.editRolesRef.validate(async validate => {
          if (!validate) return;
          const { data: res } = await this.$axios.put(`roles/${this.editRolesPlaceholder.id}`, this.editRolesForm);
          if (res.status != 200) return this.$message.error('修改角色失败！');
          this.$message.success('修改成功');
          this.editRolesDialogVisible = false;
          this.getRolesList();
        });
      },
      async removeRoles(rolesInfo) {
        const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '删除角色', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err);
        if (confirmResult != 'confirm') return;
        const { data: res } = await this.$axios.delete(`/roles/${rolesInfo.id}`);
        if (res.status != 200) return this.$message.error('删除角色失败！');
        this.$message.success('删除成功');
        this.getRolesList();
      },
      async openAllotRightDialog(rolesInfo) {
        const { data: res } = await this.$axios.get('/rights/tree');
        if (res.status != 200) return this.$message.error('获取权限失败！');
        this.rightList = res.data;
        this.getLeafKeys(rolesInfo, this.defaultChecked);
        // 保存角色id,便于后续发送请求
        this.allotRightId = rolesInfo.id;
        this.allotRightDialogVisible = true;
      },
      // 通过递归获取角色所有三级权限的id,并保存到defauleChecked中
      getLeafKeys(rightList, arr) {
        if (!rightList.children) return arr.push(rightList.id);
        rightList.children.forEach(item => this.getLeafKeys(item, arr));
      },
      allotRightDialogClosed() {
        this.defaultChecked = [];
      },
      // 分配权限
      async allotRight() {
        const checkedKeys = [
          ...this.$refs.treeRef.getCheckedKeys(),// 树形控件被选中的节点id
          ...this.$refs.treeRef.getHalfCheckedKeys()// 树形控件被半选中的节点id
        ];

        const rids = checkedKeys.join(',');
        const { data: res } = await this.$axios.post(`/roles/${this.allotRightId}/rights`, {rids});
        if (res.status != 200) return this.$message.error('分配权限失败！');
        this.$message.success('更新成功');
        this.allotRightDialogVisible = false;
        this.getRolesList();
      }
  }
};
</script>

<style lang="less" scoped>
.el-tag {
  margin: 5px;
}

.b-bottom {
  border-bottom: 1px solid #eee;
}

.b-top {
  border-top: 1px solid #eee;
}

.v-center {
  display: flex;
  align-items: center;
}
</style>
<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog"
            >添加分类</el-button
          >
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <zk-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
      >
        <!-- 是否有效 -->
        <template slot="isOk" slot-scope="scope">
          <i
            class="el-icon-success"
            style="color: #90ee90"
            v-if="!scope.row.cat_deleted"
          ></i>
          <i class="el-icon-error" style="color: #f00" v-else></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level == 0">一级</el-tag>
          <el-tag
            size="mini"
            type="success"
            v-else-if="scope.row.cat_level == 1"
            >二级</el-tag
          >
          <el-tag size="mini" type="danger" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="option" slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="showEditCateDialog(scope.row)"
            >编辑</el-button
          >
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-delete"
            @click="removeCategories(scope.row)"
            >删除</el-button
          >
        </template>
      </zk-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- 级联选择器 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="parentCateProps"
            @change="selectCateChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类对话框 -->
    <el-dialog
      title="修改分类名称"
      :visible.sync="editCateDialogVisible"
      width="50%"
      @close="editCateDialogClosed"
    >
      <el-form
        :model="editCateForm"
        :rules="editCateFormRules"
        ref="editCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button type="primary" @click="editCate">确 定</el-button>
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getCateList();
  },
  data() {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      total: 0,
      // 商品分类列表数据
      cateList: [],
      // 渲染表格列定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        {
          label: "是否有效",
          type: "template",
          template: "isOk",
        },
        {
          label: "排序",
          type: "template",
          template: "order",
        },
        {
          label: "操作",
          type: "template",
          template: "option",
        },
      ],
      addCateDialogVisible: false,
      addCateForm: {
        // 分类父ID
        cat_pid: 0,
        // 分类名称
        cat_name: "",
        // 分类层级
        cat_level: 0,
      },
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
      // 父级分类列表，用于级联选择器渲染
      parentCateList: [],
      // 级联菜单数据选项配置
      parentCateProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        expandTrigger: "hover",
        checkStrictly: true,
      },
      // 级联选择的ID
      selectedKeys: [],
      editCateDialogVisible: false,
      editCateForm: {
        cat_name: "",
      },
      editCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
      // 编辑分类提交时用到的ID
      editCateId: 0,
    };
  },
  methods: {
    // 获取商品分类列表
    async getCateList() {
      const { data: res } = await this.$axios.get("/categories", {
        params: this.queryInfo,
      });
      if (res.status != 200) return this.$message.error(res.msg);
      this.cateList = res.data.result;
      this.total = res.data.total;
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },
    showAddCateDialog() {
      this.getParentCateList();
      this.addCateDialogVisible = true;
    },
    // 获取父级分类列表
    async getParentCateList() {
      const { data: res } = await this.$axios.get("/categories", {
        params: {
          type: 2,
        },
      });
      if (res.status != 200) return this.$message.error(res.msg);
      this.parentCateList = res.data;
    },
    // 级联菜单值改变事件
    selectCateChange() {
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys.slice(-1)[0];
        this.addCateForm.cat_level = this.selectedKeys.length;
      } else {
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },
    addCateDialogClosed() {
      // 除了重置表单，还要重置级联选择器绑定数据
      this.$refs.addCateFormRef.resetFields();
      this.selectedKeys = [];
      this.addCateForm.cat_pid = 0;
      this.addCateForm.cat_level = 0;
    },
    // 添加分类
    addCate() {
      this.$refs.addCateFormRef.validate(async (validate) => {
        if (!validate) return;
        const { data: res } = await this.$axios.post(
          "/categories",
          this.addCateForm
        );
        if (res.status != 201) return this.$message.error(res.msg);
        this.$message.success("添加成功");
        this.getCateList();
        this.addCateDialogVisible = false;
      });
    },
    showEditCateDialog(cateInfo) {
      this.editCateId = cateInfo.cat_id;
      this.editCateDialogVisible = true;
    },
    editCateDialogClosed() {
      this.$refs.editCateFormRef.resetFields();
    },
    // 编辑分类
    editCate() {
      this.$refs.editCateFormRef.validate(async (validate) => {
        if (!validate) return;
        const { data: res } = await this.$axios.put(
          `/categories/${this.editCateId}`,
          this.editCateForm
        );
        if (res.status != 200) return this.$message.error(res.msg);
        this.$message.success(res.msg);
        this.getCateList();
        this.editCateDialogVisible = false;
      });
    },
    // 删除分类
    async removeCategories(cateInfo) {
      const confirmResult = await this.$confirm("此操作将永久删除该分类, 是否继续?", "确认删除", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).catch(err => err);
      if (confirmResult != 'confirm') return;
      const { data: res } = await this.$axios.delete(`/categories/${cateInfo.cat_id}`);
      if (res.status != 200) return this.$message.error(res.msg);
      this.$message.success(res.msg);
      this.getCateList();
    },
  },
};
</script>

<style lang="less" scoped>
.zk-table {
  margin: 15px 0;
}

.el-cascader {
  width: 100%;
}
</style>
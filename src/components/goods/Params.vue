<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 提示 -->
      <el-alert
        type="warning"
        title="注意：只允许为第三级分类设置相关参数！"
        show-icon
        :closable="false"
      ></el-alert>

      <el-row>
        <el-col class="cat_opt">
          <span>选择商品分类：</span>
          <!-- 选择商品分类级联选择框 -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleChange"
            clearable
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- 标签页 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >添加参数</el-button
          >
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleClose(index, scope.row)"
                  >{{ item }}</el-tag
                >
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.tagInputVisible"
                  v-model="scope.row.tagInputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showTagInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >添加属性</el-button
          >
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleClose(index, scope.row)"
                  >{{ item }}</el-tag
                >
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.tagInputVisible"
                  v-model="scope.row.tagInputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showTagInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column
              label="属性名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数/属性对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addParamsDialogCloseded"
    >
      <el-form
        :model="addParamsForm"
        :rules="addParamsFormRules"
        ref="addParamsFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数/属性对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editParamsDialogCloseded"
    >
      <el-form
        :model="editParamsForm"
        :rules="addParamsFormRules"
        ref="editParamsFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editParamsForm.attr_name" clearable></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
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
      cateList: [],
      // 级联选择框双向绑定到的数组
      selectedCateKeys: [],
      // 级联选择框配置
      cateProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      // 当前激活标签页
      activeName: "many",
      // 动态参数数据
      manyTableData: [],
      // 静态属性数据
      onlyTableData: [],
      addDialogVisible: false,
      // 添加参数对话框表单数据
      addParamsForm: {
        attr_name: "",
      },
      // 添加参数对话框表单验证规则
      addParamsFormRules: {
        attr_name: [
          { required: true, message: `请输入参数名称`, trigger: "blur" },
        ],
      },
      // 控制修改参数对话框显示与隐藏
      editDialogVisible: false,
      // 修改参数表单数据
      editParamsForm: {},
    };
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$axios.get("/categories");
      if (res.status != 200) return this.$message.error(res.msg);
      this.cateList = res.data;
    },
    // 级联选择框值改变事件
    handleChange() {
      this.getParamsData();
    },
    async getParamsData() {
      // 当选中的不是三级菜单则重置为空
      if (this.selectedCateKeys.length != 3) {
        this.selectedCateKeys = [];
        // 防止之前的请求缓存数据，先清空在发送请求重新更新数据
        this.manyTableData = [];
        this.onlyTableData = [];
        return;
      }
      // 获取参数列表
      const { data: res } = await this.$axios.get(
        `/categories/${this.selectedId}/attributes`,
        {
          params: {
            sel: this.activeName,
          },
        }
      );
      console.log(res.data);
      if (res.status != 200) return this.$message.error(res.msg);
      // 将得到的属性值切割为数组
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        item.tagInputVisible = false;
        item.tagInputValue = "";
      });
      this.activeName == "many"
        ? (this.manyTableData = res.data)
        : (this.onlyTableData = res.data);
    },
    // 标签页选中值事件
    handleTabClick() {
      this.getParamsData();
    },
    // 添加参数对话框关闭重置表单校验
    addParamsDialogCloseded() {
      this.$refs.addParamsFormRef.resetFields();
    },
    // 添加参数
    addParams() {
      // 发送请求之前先进行表单预验证
      this.$refs.addParamsFormRef.validate(async (validate) => {
        if (!validate) return;
        const { data: res } = await this.$axios.post(
          `/categories/${this.selectedId}/attributes`,
          {
            attr_name: this.addParamsForm.attr_name,
            attr_sel: this.activeName,
          }
        );
        if (res.status != 201) return this.$message.error(res.msg);
        this.$message.success("添加成功");
        this.addDialogVisible = false;
        this.getParamsData();
      });
    },
    // 点击编辑按钮展示修改对话框
    async showEditDialog(attrId) {
      const { data: res } = await this.$axios.get(
        `/categories/${this.selectedId}/attributes/${attrId}`,
        {
          params: {
            attr_sel: this.activeName,
          },
        }
      );
      if (res.status != 200) return this.$message.error(res.msg);
      this.editParamsForm = res.data;
      this.editDialogVisible = true;
    },
    editParamsDialogCloseded() {
      this.$refs.editParamsFormRef.resetFields();
    },
    // 参数编辑提交
    editParams() {
      this.$refs.editParamsFormRef.validate(async (validate) => {
        if (!validate) return;
        const { data: res } = await this.$axios.put(
          `/categories/${this.selectedId}/attributes/${this.editParamsForm.attr_id}`,
          {
            attr_name: this.editParamsForm.attr_name,
            attr_sel: this.activeName,
          }
        );
        if (res.status != 200) return this.$message.error(res.msg);
        this.$message.success(res.msg);
        this.editDialogVisible = false;
        this.getParamsData();
      });
    },
    // 删除参数业务
    async removeParams(attrId) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该参数, 是否继续?",
        "提示",
        {
          confirmButtonText: "删除",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmResult != "confirm") return;
      const { data: res } = await this.$axios.delete(
        `/categories/${this.selectedId}/attributes/${attrId}`
      );
      if (res.status != 200) return this.$message.error(res.msg);
      this.$message.success(res.msg);
      this.getParamsData();
    },
    handleInputConfirm(row) {
      // 如果输入的字符不合法就重置为空字符串
      if (row.tagInputValue.trim().length == 0) {
        row.tagInputValue = '';
        row.tagInputVisible = false;
        return;
      }

      // 将数据添加至渲染的数据之后
      row.attr_vals.push(row.tagInputValue.trim());
      row.tagInputValue = '';
      row.tagInputVisible = false;

      // 发送请求将数据持久化
      this.saveAttrVals(row);
    },
    // 持久化参数标签数据
    async saveAttrVals(row) {
      const { data: res } = await this.$axios.put(`/categories/${this.selectedId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: this.activeName,
        attr_vals: row.attr_vals.join(' ')
      });
      if (res.status != 200) return this.$message.error(res.msg);
      this.$message.success(res.msg);
    },
    showTagInput(row) {
      row.tagInputVisible = true;
      // $nextTick() 当页面元素重新渲染之后自动触发
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    handleClose(index, row) {
      // 从标签数组中删除对应元素实现删除
      row.attr_vals.splice(index, 1);
      // 将数据持久化到数据库中
      this.saveAttrVals(row);
    }
  },
  computed: {
    // 通过计算属性来控制按钮是否禁用 级联菜单选中三级才可以使用
    isBtnDisabled() {
      return this.selectedCateKeys.length == 3 ? false : true;
    },
    // 计算发起参数请求的id
    selectedId() {
      return this.selectedCateKeys.length == 3
        ? this.selectedCateKeys[2]
        : null;
    },
    // 打开对话框的标题
    titleText() {
      return this.activeName == "many" ? "动态参数" : "静态属性";
    },
  },
};
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}

.el-tag {
  margin: 5px 5px;
}

.input-new-tag {
  width: 90px;
  margin-left: 5px;
}

.button-new-tag {
  margin-left: 5px;
}
</style>
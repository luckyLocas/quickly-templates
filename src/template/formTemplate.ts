// 默认的新增编辑表单页模板内容
const formPageTemplate = `  
import {
	ModalForm,
	ProFormInstance,
	ProFormText,
	ProFormTextArea,
	ProFormDependency,
  } from '@ant-design/pro-form';
  import CButton from '@src/bizComponents/cButton';
  import { message } from 'antd';
  import React, { memo, useMemo, useRef } from 'react';
  
  import { AddOrEditWarehouse } from '../services';
  
  interface IProps {
	type: 'add' | 'edit';
	refresh: () => void;
	record?: IFormItem;
  }
  
  interface IFormItem {
	id?: string;
	wareHouseName: string;
	remark: string;
	stationId?: string;
  }
  
  /**
   * 新增/编辑库房
   */
  const AddOrEdit: React.FC<IProps> = memo(({ type, refresh, record }) => {
	const formRef = useRef<ProFormInstance<IFormItem>>();
  
	const submit = async (values: IFormItem) => {
	  console.log('values', values);
	  const res = await AddOrEditWarehouse({
		id: record?.id,
		...values,
		wareHouseName: values.wareHouseName?.trim(),
	  });
	  if (res) {
		message.success(record ? '修改成功' : '新增成功');
		refresh();
	  }
	  return res;
	};
  
	const title = useMemo(() => {
	  return type === 'add' ? '新增库房' : '编辑';
	}, [type]);
  
	const onVisibleChange = (visible: boolean) => {
	  if (visible) {
		formRef.current?.resetFields();
		if (record) {
		  formRef.current?.setFieldsValue(record);
		}
	  }
	};
  
	return (
	  <ModalForm
		formRef={formRef}
		title={title}
		width={600}
		modalProps={{
		  maskClosable: false,
		  bodyStyle: { maxHeight: '70vh', overflowY: 'auto' },
		}}
		onVisibleChange={onVisibleChange}
		onFinish={submit}
		trigger={
		  type === 'add' ? (
			<CButton type="primary">{title}</CButton>
		  ) : (
			<CButton type="link" inline>
			  {title}
			</CButton>
		  )
		}>
		<ProFormText
		  name="wareHouseName"
		  label="库房名称"
		  rules={[
			{ required: true },
			{ pattern: /S/, message: '请输入库房名称' },
		  ]}
		  fieldProps={{
			maxLength: 20,
			placeholder: '最多20个字',
		  }}
		/>
		<ProFormDependency name={['wareHouseName']}>
		  {({ wareHouseName }) => {
			return (
			  <ProFormText
				label="哈哈"
				name="mixer"
				placeholder="请输入文本(20字内)"
				fieldProps={{
				  maxLength: 20,
				}}
				disabled
				rules={[{ required: true }]}
			  />
			);
		  }}
		</ProFormDependency>
		<ProFormTextArea
		  name="remark"
		  label="备注"
		  fieldProps={{
			maxLength: 100,
			placeholder: '最多100个字',
			showCount: true,
		  }}
		/>
	  </ModalForm>
	);
  });
  
  export default AddOrEdit;
`

export default formPageTemplate

// 默认的请求模板内容
const servicesTemplate = `  
import { Net } from '@src/bll/services/newNet';
import { Toast } from '@src/utils/WinToast';

/**获取库房管理列表数据 */
export async function GetTableData(params: {
  pageNum?: number;
  pageSize?: number;
  wareHouseName?: string;
}): Promise<{ data: any[]; total: number }> {
  return Net.getInstance()
    .post({ ...params, deleteState: 0 }, '/listWareHousePage')
    .then((res: any) => {
      return {
        data: res?.list ?? [],
        total: res?.total ?? 0,
      };
    })
    .catch(error => {
      Toast.error(error);
      return {
        data: [],
        total: 0,
      };
    });
}

/**
 * 新增/编辑库房
 * @export
 * @param {id:string} request
 * @return {*}
 */
export async function AddOrEditWarehouse(request: any): Promise<boolean> {
  return Net.getInstance()
    .post<any, boolean>({ ...request }, '/addOrUpdateWareHouse')
    .then(() => {
      return true;
    })
    .catch(error => {
      Toast.error(error);
      return false;
    });
}

/**
 * 删除库房
 * @export
 * @param {id:string} request
 * @return {*}
 */
export async function DeleteWarehouse(request: {
  id?: string;
}): Promise<boolean> {
  return Net.getInstance()
    .post<{ id?: string }, boolean>(
      { ...request },
      '/warehouse/deleteWareHouse',
    )
    .then(() => {
      return true;
    })
    .catch(error => {
      Toast.error(error);
      return false;
    });
}
`
export default servicesTemplate

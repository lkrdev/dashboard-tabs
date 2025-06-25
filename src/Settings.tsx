import {
  ButtonOutline,
  Checkbox,
  Dialog,
  DialogContent,
  DialogHeader,
  Divider,
  InputChips,
  InputSearch,
  InputText,
  Label,
  Space,
  SpaceVertical,
  Span,
} from "@looker/components";
import { useFormik } from "formik";
import React, { useEffect } from "react";
import useSWR from "swr";
import { useBoolean, useDebounceValue } from "usehooks-ts";
import { useAppContext } from "./AppContext";
import { useToast } from "./components/Toast/ToastContext";
import {
  IExtensionContextData,
  useExtensionContextData,
} from "./hooks/useExtensionContext";
import useSdk from "./hooks/useSdk";

const Settings: React.FC = () => {
  const { showSuccess } = useToast();
  const open = useBoolean(false);
  const [debounced_search, setDebouncedSearch] = useDebounceValue("", 500);
  const sdk = useSdk();
  const searched_dashboards = useSWR(
    `debounced_search=${debounced_search}`,
    () =>
      sdk.ok(
        sdk.search_dashboards({
          limit: 50,
          title: debounced_search?.length ? `%${debounced_search}%` : undefined,
          sorts: "title",
        })
      )
  );
  const { is_admin } = useAppContext();
  const {
    config_data,
    updateValues,
    checkCurrentUserCanUpdateSettings,
    can_update_settings,
  } = useExtensionContextData();

  const { values, ...formik } = useFormik({
    validateOnChange: false,
    validateOnBlur: true,
    initialValues: {
      dashboards: config_data.dashboards || [],
      restrict_settings: config_data.restrict_settings || false,
      print_all_dashboards: config_data.print_all_dashboards || false,
      setting_group_ids: config_data.setting_group_ids || [],
      label: config_data.label || "",
      enable_folder_navigation: config_data.enable_folder_navigation || false,
      enable_board_navigation: config_data.enable_board_navigation || false,
    } as IExtensionContextData,
    validate: async (values) => {
      let errors: Partial<{ [key in keyof IExtensionContextData]: string }> =
        {};
      if (values.restrict_settings) {
        if (!is_admin) {
          const check = checkCurrentUserCanUpdateSettings(
            values.setting_group_ids || []
          );
          if (!check) {
            errors.setting_group_ids =
              "Unable to update restrict settings as your user is not in the Group IDs and is not an admin";
          }
        }
      }
      return errors;
    },
    onSubmit: (values) => {
      updateValues(values);
      showSuccess(
        "Settings updated, please refresh the page to see the changes",
        5000
      );
    },
  });
  useEffect(() => {
    formik.resetForm({ values: config_data });
  }, [config_data]);

  return (
    <>
      <ButtonOutline fullWidth onClick={() => open.setTrue()}>
        Settings
      </ButtonOutline>
      <Dialog
        isOpen={open.value}
        onClose={async () => {
          const errors = await formik.validateForm();
          if (Object.keys(errors).length === 0) {
            await formik.handleSubmit();
            open.setFalse();
          }
        }}
      >
        <DialogHeader>Settings</DialogHeader>
        <DialogContent minHeight={"400px"}>
          <SpaceVertical gap="xsmall">
            <Space>
              <Label>Default Extension Label</Label>
              <InputText
                name="label"
                value={values.label}
                onChange={(e) => formik.setFieldValue("label", e.target.value)}
              />
            </Space>
            <Space>
              <Label>Dashboard IDs for the tabs</Label>
              <InputChips
                placeholder="Dashboard IDs"
                name="dashboards"
                values={values.dashboards || []}
                onChange={(values: string[]) =>
                  formik.setFieldValue("dashboards", values)
                }
              />
            </Space>
            <InputSearch
              options={searched_dashboards.data?.map((d) => ({
                value: d.id!,
                label: d.title!,
              }))}
              onChange={(value: string) => setDebouncedSearch(value)}
              onSelectOption={(v) =>
                formik.setFieldValue("dashboards", [
                  ...(values.dashboards || []),
                  v!.value,
                ])
              }
              changeOnSelect={false}
              placeholder="Search dashboards and click to add"
            />
            <Divider />
            <Space>
              <Checkbox
                name="print_all_dashboards"
                checked={values.print_all_dashboards || false}
                onChange={(e) => {
                  formik.setFieldValue(
                    "print_all_dashboards",
                    e.target.checked
                  );
                }}
              />
              <Label
                onClick={() => {
                  formik.setFieldValue(
                    "print_all_dashboards",
                    !values.print_all_dashboards
                  );
                }}
              >
                Allow printing all dashboards
              </Label>
            </Space>
            <Space>
              <Checkbox
                name="enable_folder_navigation"
                checked={values.enable_folder_navigation || false}
                onChange={(e) => {
                  formik.setFieldValue(
                    "enable_folder_navigation",
                    e.target.checked
                  );
                }}
              />
              <Label
                onClick={() => {
                  formik.setFieldValue(
                    "enable_folder_navigation",
                    !values.enable_folder_navigation
                  );
                }}
              >
                Enable Folder Navigation
              </Label>
            </Space>
            <Space>
              <Checkbox
                name="enable_board_navigation"
                checked={values.enable_board_navigation || false}
                onChange={(e) => {
                  formik.setFieldValue(
                    "enable_board_navigation",
                    e.target.checked
                  );
                }}
              />
              <Label
                onClick={() => {
                  formik.setFieldValue(
                    "enable_board_navigation",
                    !values.enable_board_navigation
                  );
                }}
              >
                Enable Board Navigation
              </Label>
            </Space>
            <Divider />
            <Space>
              <Checkbox
                name="restrict_settings"
                checked={values.restrict_settings}
                onChange={(e) => {
                  formik.setFieldValue("restrict_settings", e.target.checked);
                }}
              />
              <Label>Restrict Settings</Label>
            </Space>
            {Boolean(values.restrict_settings) && (
              <Space>
                <Label>Group IDs allowed to update settings</Label>
                <InputChips
                  name="setting_group_ids"
                  values={values.setting_group_ids || []}
                  onChange={(values: string[]) =>
                    formik.setFieldValue("setting_group_ids", values)
                  }
                />
              </Space>
            )}
            {formik.errors.setting_group_ids && (
              <Span color="critical" type="error" fontSize="xsmall">
                {formik.errors.setting_group_ids}
              </Span>
            )}
          </SpaceVertical>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Settings;

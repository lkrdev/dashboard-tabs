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
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { useBoolean, useDebounceValue } from "usehooks-ts";
import { useAppContext } from "./AppContext";
import ProgressIndicator from "./components/ProgressIndicator";
import { useToast } from "./components/Toast/ToastContext";
import useConfigContext, { IExtensionConfig } from "./ConfigContext";
import useSdk from "./hooks/useSdk";

const Settings: React.FC = () => {
  const { showSuccess } = useToast();
  const open = useBoolean(false);
  const [debounced_search, setDebouncedSearch] = useDebounceValue("", 500);
  const [search, setSearch] = useState("");
  const sdk = useSdk();
  const searched_dashboards = useSWR(
    `debounced_search=${debounced_search}`,
    () =>
      sdk.ok(
        sdk.search_dashboards({
          limit: 50,
          title: debounced_search?.length
            ? `%${debounced_search.replace(/\s/g, "%")}%`
            : undefined,
          sorts: "title",
        })
      )
  );
  const { is_admin } = useAppContext();
  const {
    config: config_data,
    updateConfig,
    can_update_settings,
    checkCurrentUserCanUpdateSettings,
  } = useConfigContext();

  const { values, ...formik } = useFormik({
    validateOnChange: false,
    validateOnBlur: true,
    initialValues: {
      dashboards: config_data.dashboards || [],
      restrict_settings: config_data.restrict_settings || false,
      print_all_dashboards: config_data.print_all_dashboards || true,
      setting_group_ids: config_data.setting_group_ids || [],
      label: config_data.label || "",
      enable_folder_navigation: config_data.enable_folder_navigation || true,
      enable_board_navigation: config_data.enable_board_navigation || true,
      allow_adhoc_dashboards: config_data.allow_adhoc_dashboards || true,
      save_board_from_adhoc_dashboards:
        config_data.save_board_from_adhoc_dashboards || true,
    } as IExtensionConfig,
    validate: async (values) => {
      let errors: Partial<{ [key in keyof IExtensionConfig]: string }> = {};
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
      updateConfig({ ...values });
      showSuccess("Settings updated", 5000);
    },
  });
  useEffect(() => {
    formik.resetForm({ values: config_data });
  }, [config_data]);

  const isDebouncing = debounced_search !== search;

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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  formik.setFieldValue("label", e.target.value)
                }
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
              options={
                isDebouncing
                  ? []
                  : searched_dashboards.data?.map((d) => ({
                      value: d.id!,
                      label: d.title!,
                    }))
              }
              value={search}
              onChange={(value: string) => {
                setDebouncedSearch(value);
                setSearch(value);
              }}
              onSelectOption={(option) => {
                if (option?.value) {
                  formik.setFieldValue("dashboards", [
                    ...(values.dashboards || []),
                    option.value,
                  ]);
                }
              }}
              changeOnSelect={false}
              placeholder="Search dashboards and click to add"
            />
            <ProgressIndicator
              show={searched_dashboards.isLoading || isDebouncing}
            />
            <Divider />
            <Space>
              <Checkbox
                name="print_all_dashboards"
                checked={values.print_all_dashboards || false}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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
                name="allow_adhoc_dashboards"
                checked={values.allow_adhoc_dashboards || false}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  formik.setFieldValue(
                    "allow_adhoc_dashboards",
                    e.target.checked
                  );
                }}
              />
              <Label
                onClick={() => {
                  formik.setFieldValue(
                    "allow_adhoc_dashboards",
                    !values.allow_adhoc_dashboards
                  );
                }}
              >
                Allow Adhoc Dashboards
              </Label>
            </Space>
            <Space>
              <Checkbox
                name="enable_board_navigation"
                checked={values.enable_board_navigation || false}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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
            {values.allow_adhoc_dashboards &&
              values.enable_board_navigation && (
                <Space>
                  <Checkbox
                    name="save_board_from_adhoc_dashboards"
                    checked={values.save_board_from_adhoc_dashboards || false}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      formik.setFieldValue(
                        "save_board_from_adhoc_dashboards",
                        e.target.checked
                      );
                    }}
                  />
                  <Label
                    onClick={() => {
                      formik.setFieldValue(
                        "save_board_from_adhoc_dashboards",
                        !values.save_board_from_adhoc_dashboards
                      );
                    }}
                  >
                    Save Board from Adhoc Dashboards
                  </Label>
                </Space>
              )}
            <Divider />
            <Space>
              <Checkbox
                name="restrict_settings"
                checked={values.restrict_settings}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  formik.setFieldValue("restrict_settings", e.target.checked);
                }}
              />
              <Label>Restrict Settings</Label>
            </Space>
            {Boolean(values.restrict_settings) && (
              <Space>
                <Label>Group IDs</Label>
                <InputChips
                  placeholder="Group IDs allowed to update settings (in addition to Looker
                    admins)"
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
            <Divider />
            <Space>
              <Checkbox
                name="remove_branded_loading"
                checked={values.remove_branded_loading}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  formik.setFieldValue(
                    "remove_branded_loading",
                    e.target.checked
                  );
                }}
              />
              <Label>Remove Branded Loading</Label>
            </Space>
          </SpaceVertical>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Settings;

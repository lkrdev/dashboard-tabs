import {
  Button,
  ButtonOutline,
  InputText,
  Label,
  Popover,
  PopoverLayout,
  SpaceVertical,
} from "@looker/components";
import React, { useRef } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useBoolean } from "usehooks-ts";
import { useAppContext } from "../AppContext";
import ProgressIndicator from "../components/ProgressIndicator";
import useSdk from "../hooks/useSdk";

const AdhocDashboard: React.FC = () => {
  const open = useBoolean(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const sdk = useSdk();
  const history = useHistory();
  const location = useLocation();
  const [error, setError] = React.useState<string | null>(null);
  const { adhoc_dashboard_ids } = useAppContext();

  const saving = useBoolean(false);

  const handleSave = async (value: string) => {
    saving.setTrue();
    let error_messages = [];
    setError(null);
    const board = await sdk.create_board({
      title: value,
      description: "",
    });
    if (board.ok) {
      const board_section_promise = sdk.create_board_section({
        title: "",
        board_id: board.value.id,
      });
      const favorite_promise = sdk.create_content_favorite({
        content_metadata_id: board.value.content_metadata_id!,
      });
      const [board_section, favorite] = await Promise.all([
        board_section_promise,
        favorite_promise,
      ]);
      if (board_section.ok) {
        const board_items_promises = (adhoc_dashboard_ids || []).map(
          (dashboard_id, index) => {
            return sdk.create_board_item({
              dashboard_id: dashboard_id,
              board_section_id: board_section.value.id,
              order: index,
            });
          }
        );
        const board_items = await Promise.all(board_items_promises);
        if (board_items.every((item) => item.ok)) {
          const new_url = `/boards/${board.value.id}${location.search}`;
          history.push(new_url);
        } else {
          board_items.forEach((item) => {
            if (!item.ok) {
              error_messages.push(item.error.message);
            }
          });
        }
      } else {
        error_messages.push(board_section.error.message);
      }
    } else {
      // @ts-expect-error board.error is not typed properly
      setError(board.error.errors[0].message);
    }
    saving.setFalse();
  };

  return (
    <Popover
      placement="right-start"
      isOpen={open.value}
      content={
        <PopoverLayout
          header="Save as Board"
          closeButton={
            <SpaceVertical gap="xxsmall">
              <Button
                disabled={saving.value}
                onClick={() => {
                  if (inputRef.current?.value) {
                    handleSave(inputRef.current.value);
                  }
                }}
                size="medium"
              >
                Save Board
              </Button>
              <ProgressIndicator show={saving.value} />
            </SpaceVertical>
          }
        >
          <SpaceVertical
            gap="xsmall"
            justify="center"
            align="center"
            height="100px"
            width="300px"
          >
            <SpaceVertical gap="xsmall">
              <Label>Board Name</Label>
              <InputText
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (inputRef.current?.value) {
                      try {
                        handleSave(inputRef.current.value);
                      } catch (error: any) {
                        setError(error.message);
                        saving.setFalse();
                      }
                    }
                  }
                }}
                ref={inputRef}
                autoFocus={true}
              />
              <Label
                style={{ visibility: error ? "visible" : "hidden" }}
                color="critical"
              >
                {error || "error"}
              </Label>
            </SpaceVertical>
          </SpaceVertical>
        </PopoverLayout>
      }
    >
      <ButtonOutline fullWidth onClick={() => open.setTrue()} color="neutral">
        Save as Board
      </ButtonOutline>
    </Popover>
  );
};

export default AdhocDashboard;

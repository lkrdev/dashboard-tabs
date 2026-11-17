import {
  CopyToClipboard,
  IconButton,
  ListItem,
  ModalHeaderCloseButton,
  Popover,
  PopoverContent,
  PopoverHeader,
  Span,
} from "@looker/components";
import { Check, ContentCopy, Delete, Info } from "@styled-icons/material";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import useSWR from "swr";
import { useAppContext } from "../AppContext";
import Skeleton from "../components/Skeleton";
import useConfigContext from "../ConfigContext";
import useSdk from "../hooks/useSdk";
import { adjustColorLightness } from "../utils/colorUtils";
import { briefDescription } from "../utils/getBoardList";

const StyledListItem = styled(ListItem)<{ paperColor?: string }>`
  ${({ paperColor, selected }) =>
    paperColor
      ? `& > a { background-color: ${
          selected ? adjustColorLightness(paperColor, 0.1) : paperColor
        }; }`
      : ""}
  position: relative;
  & .dash-actions {
    display: none;
  }
  &:hover .dash-actions,
  & .dash-actions[data-open="true"] {
    display: inline-flex;
    position: absolute;
    right: 4px;
    top: 50%;
    transform: translateY(-50%);
    align-items: center;
    gap: 2px;
    background: ${({ paperColor, selected }) =>
      paperColor
        ? selected
          ? adjustColorLightness(paperColor, 0.1)
          : paperColor
        : "rgba(246, 248, 250, 0.92)"};
    border-radius: 6px;
    padding: 0 2px;
  }
`;

const DashboardItem = ({
  dashboard_id,
  fallback_title,
  from_board,
}: {
  dashboard_id: string;
  fallback_title?: string;
  from_board?: boolean;
}) => {
  const {
    selected_dashboard_id,
    adhoc_dashboard_ids,
    changeDashboardId,
    toggleAdhocDashboardId,
  } = useAppContext();
  const {
    config: { theme, paper_color, display_dashboard_descriptions },
  } = useConfigContext();
  const sdk = useSdk();
  const [infoOpen, setInfoOpen] = useState(false);
  const db = useSWR(`dashboard-${dashboard_id}`, () =>
    sdk.ok(sdk.dashboard(dashboard_id, "id,title,description"))
  );

  useEffect(() => {
    if (!infoOpen) return;
    const close = () => setInfoOpen(false);
    window.addEventListener("blur", close);
    return () => window.removeEventListener("blur", close);
  }, [infoOpen]);

  const is_adhoc = Boolean(adhoc_dashboard_ids);
  const selected = selected_dashboard_id === dashboard_id;
  const title = db.data?.title || fallback_title || dashboard_id;
  const description = display_dashboard_descriptions
    ? db.data?.description?.trim()
    : undefined;
  const brief = briefDescription(description);

  const actions =
    brief || is_adhoc ? (
      <div className="dash-actions" data-open={infoOpen}>
        {brief && (
          <Popover
            isOpen={infoOpen}
            setOpen={setInfoOpen}
            placement="right"
            width="560px"
            content={
              <>
                <PopoverHeader
                  detail={
                    <span style={{ display: "inline-flex", gap: 2 }}>
                      <CopyToClipboard
                        content={description!}
                        success={
                          <IconButton icon={<Check />} size="small" label="Copied" />
                        }
                      >
                        <IconButton
                          icon={<ContentCopy />}
                          size="small"
                          label="Copy to clipboard"
                        />
                      </CopyToClipboard>
                      <ModalHeaderCloseButton size="small" />
                    </span>
                  }
                >
                  {title}
                </PopoverHeader>
                <PopoverContent>
                  <Span
                    fontSize="xsmall"
                    color="text"
                    style={{ whiteSpace: "pre-wrap", lineHeight: 1.45 }}
                  >
                    {description}
                  </Span>
                </PopoverContent>
              </>
            }
          >
            <IconButton
              icon={<Info />}
              size="xxsmall"
              label={brief}
              tooltipPlacement="top"
              tooltipWidth="220px"
              tooltipTextAlign="left"
            />
          </Popover>
        )}
        {is_adhoc && (
          <IconButton
            icon={<Delete />}
            size="xxsmall"
            onClick={(e) => {
              e.stopPropagation();
              toggleAdhocDashboardId(dashboard_id);
            }}
            label="Remove"
          />
        )}
      </div>
    ) : null;

  const content = db.isLoading ? (
    <Skeleton show width="100%" color="transparent" height="100%">
      Loading...
    </Skeleton>
  ) : (
    title
  );

  if (theme === "horizon") {
    return (
      <div className="hz-item-wrap" data-active={selected}>
        <button
          type="button"
          className="hz-item"
          data-active={selected}
          onClick={() => changeDashboardId(dashboard_id)}
        >
          <span>{content}</span>
          {selected && <span className="hz-chev">›</span>}
        </button>
        {actions}
      </div>
    );
  }

  return (
    <StyledListItem
      paperColor={from_board ? undefined : paper_color}
      itemRole="link"
      selected={selected}
      onClick={() => changeDashboardId(dashboard_id)}
      detail={
        actions ? { content: actions, options: { accessory: true } } : undefined
      }
    >
      {content}
    </StyledListItem>
  );
};

export default DashboardItem;

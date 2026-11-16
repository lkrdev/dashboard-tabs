import type { IBoard } from "@looker/sdk";

export const briefDescription = (text?: string | null, max = 80): string => {
  const clean = text?.replace(/\s+/g, " ").trim() || "";
  return clean.length > max ? `${clean.slice(0, max).trimEnd()}…` : clean;
};

export const groupBoardForHorizon = (
  list: IBoardList[],
  boardDescription?: string | null
) => {
  const raw: Array<{
    id: string;
    title?: string;
    description?: string;
    items: IBoardList[];
  }> = [];
  for (const entry of list) {
    if (entry.type === "section") {
      raw.push({
        id: entry.id,
        title: entry.title === "Section" ? undefined : entry.title,
        description: entry.description,
        items: [],
      });
    } else {
      if (!raw.length) raw.push({ id: "ungrouped", items: [] });
      raw[raw.length - 1].items.push(entry);
    }
  }
  const leadEmpty = raw[0]?.items.length === 0 ? raw[0] : undefined;
  const subtitle =
    boardDescription?.trim() || leadEmpty?.description || leadEmpty?.title;
  return {
    subtitle: subtitle || undefined,
    groups: raw.filter((g) => g.items.length > 0),
  };
};

export interface IBoardList {
  type: "dashboard" | "section";
  title: string;
  id: string;
  description?: string;
}

export const getBoardList = (board: IBoard): IBoardList[] => {
  if (!board.board_sections?.length && !board.section_order?.length) {
    return [] as IBoardList[];
  } else {
    return board.section_order!.reduce((acc, section_id) => {
      const s = board.board_sections!.find((s) => s.id === section_id);
      if (!s) {
        return acc;
      } else {
        acc.push({
          type: "section",
          title: s.title || "Section",
          id: s.id || "",
          description: s.description || undefined,
        });
      }
      if (s.board_items?.length) {
        s.item_order!.forEach((item_id) => {
          const bi = s.board_items!.find((bi) => bi.id === item_id);
          if (!bi) {
            return acc;
          }
          const dashboard_id = bi.dashboard_id || bi.lookml_dashboard_id;
          if (dashboard_id) {
            acc.push({
              type: "dashboard",
              title: bi.title || "Dashboard",
              id: dashboard_id,
            });
          }
        });
      }
      return acc;
    }, [] as IBoardList[]);
  }
};

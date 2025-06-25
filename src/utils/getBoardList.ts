import { IBoard } from "@looker/sdk";

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

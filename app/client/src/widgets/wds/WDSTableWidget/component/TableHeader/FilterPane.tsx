import React, { Component } from "react";
import { connect } from "react-redux";
import { get } from "lodash";
import * as log from "loglevel";
import type { AppState } from "@appsmith/reducers";
import styled from "styled-components";

import { Colors } from "constants/Colors";
import type { ReactTableColumnProps, ReactTableFilter } from "../Constants";
import TableFilterPaneContent from "./FilterPaneContent";
import { getCurrentThemeMode, ThemeMode } from "selectors/themeSelectors";
import { Layers } from "constants/Layers";
import Popper from "pages/Editor/Popper";
import { getTableFilterState } from "selectors/tableFilterSelectors";
import { getWidgetMetaProps } from "sagas/selectors";
import { ReduxActionTypes } from "@appsmith/constants/ReduxActionConstants";
import type { WidgetProps } from "widgets/BaseWidget";
import { selectWidgetInitAction } from "actions/widgetSelectionActions";
import { SelectionRequestType } from "sagas/WidgetSelectUtils";
import { importSvg } from "design-system-old";
import { CANVAS_ART_BOARD } from "constants/componentClassNameConstants";

const DragHandleIcon = importSvg(
  async () => import("assets/icons/ads/app-icons/draghandler.svg"),
);

const DragBlock = styled.div`
  height: 40px;
  width: 83px;
  background: var(--wds-color-bg-light);
  box-sizing: border-box;
  font-size: 12px;
  color: ${Colors.GREY_11};
  letter-spacing: 0.04em;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  span {
    padding-left: 8px;
    color: var(--wds-color-text-light);
  }
`;

export interface TableFilterPaneProps {
  widgetId: string;
  columns: ReactTableColumnProps[];
  filters?: ReactTableFilter[];
  applyFilter: (filters: ReactTableFilter[]) => void;
  targetNode?: Element;
}

interface PositionPropsInt {
  top: number;
  left: number;
}

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  TableFilterPaneProps;

class TableFilterPane extends Component<Props> {
  getPopperTheme() {
    return ThemeMode.LIGHT;
  }

  handlePositionUpdate = (position: any) => {
    this.props.setPanePosition(
      this.props.tableFilterPane.widgetId as string,
      position,
    );
  };

  render() {
    if (
      this.props.tableFilterPane.isVisible &&
      this.props.tableFilterPane.widgetId === this.props.widgetId
    ) {
      log.debug("tablefilter pane rendered");

      /*
        Prevent the FilterPane from overflowing the canvas when the
        table widget is on the very top of the canvas.
      */
      const boundaryParent = document.querySelector("#root");

      return (
        <Popper
          boundaryParent={boundaryParent || "viewport"}
          disablePopperEvents={
            get(this.props, "metaProps.isMoved", false) as boolean
          }
          isDraggable
          isOpen
          onPositionChange={this.handlePositionUpdate}
          parentElement={boundaryParent}
          placement="top"
          portalContainer={
            document.getElementById(CANVAS_ART_BOARD) || undefined
          }
          position={get(this.props, "metaProps.position") as PositionPropsInt}
          renderDragBlock={
            <DragBlock>
              <DragHandleIcon />
              <span>Move</span>
            </DragBlock>
          }
          renderDragBlockPositions={{
            left: "0px",
          }}
          targetNode={this.props.targetNode}
          themeMode={this.getPopperTheme()}
          zIndex={Layers.tableFilterPane}
        >
          <TableFilterPaneContent {...this.props} />
        </Popper>
      );
    } else {
      return null;
    }
  }
}

const mapStateToProps = (state: AppState, ownProps: TableFilterPaneProps) => {
  const widgetLikeProps = {
    widgetId: ownProps.widgetId,
  } as WidgetProps;

  return {
    tableFilterPane: getTableFilterState(state),
    themeMode: getCurrentThemeMode(state),
    metaProps: getWidgetMetaProps(state, widgetLikeProps),
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setPanePosition: (widgetId: string, position: any) => {
      dispatch({
        type: ReduxActionTypes.TABLE_PANE_MOVED,
        payload: {
          widgetId,
          position,
        },
      });
      dispatch(selectWidgetInitAction(SelectionRequestType.One, [widgetId]));
    },
    hideFilterPane: (widgetId: string) => {
      dispatch({
        type: ReduxActionTypes.HIDE_TABLE_FILTER_PANE,
        payload: { widgetId },
      });
      dispatch(selectWidgetInitAction(SelectionRequestType.One, [widgetId]));
    },
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(TableFilterPane);

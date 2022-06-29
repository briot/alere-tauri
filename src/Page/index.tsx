/**
 * A button that displays a page, showing a number of hard-coded panels
 */
import * as React from 'react';
import { Redirect } from 'react-router-dom';
import { SetHeader } from '@/Header';
import { DashboardFromPanels } from '@/Dashboard';
import { PanelBaseProps } from '@/Dashboard/Panel';
import { usePages } from '@/services/usePages';
import './Page.scss';

interface PageProps {
   url: string;
}
export const Page: React.FC<PageProps & SetHeader> = React.memo(p => {
   const { setHeader } = p;
   const { getPage, getPanels, deletePage, updatePage } = usePages();
   const page = getPage(p.url);
   const { headerNode } = page;
   const centralPanels = getPanels(page, "central");
   const rightPanels = React.useMemo(
      () => getPanels(page, "right").map(p => ({...p, allowCollapse: true})),
      [getPanels, page]
   );

   const updateRight = React.useCallback(
      (func: ((prev: PanelBaseProps[]) => PanelBaseProps[])) =>
         updatePage(page, func(rightPanels), "right"),
      [updatePage, page, rightPanels]
   );
   const updateCentral = React.useCallback(
      (func: ((prev: PanelBaseProps[]) => PanelBaseProps[])) =>
         updatePage(page, func(centralPanels), "central"),
      [updatePage, page, centralPanels]
   );

   // Delete temporary pages when we move away from them
   React.useEffect(
      () => () => {
         if (page?.tmp) {
            deletePage(page);
         }
      },
      [page?.tmp, page, deletePage]
   );

   React.useEffect(
      () => setHeader(headerNode
         ? {node: headerNode()}
         : {name: page.name}),
      [setHeader, page.name, headerNode]
   );

   if (!page) {
      return <Redirect to="/" />;
   }
   return (
      <>
          <DashboardFromPanels
             className="main"
             panels={centralPanels}
             setPanels={updateCentral}
          />
          <DashboardFromPanels
              className="rsidebar"
              panels={rightPanels}
              setPanels={updateRight}
          />
      </>
   );
});

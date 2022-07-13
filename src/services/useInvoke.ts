import * as React from 'react';
import useSWR from 'swr';
import { invoke } from '@tauri-apps/api'

/// Invoke a Tauri command and pass arguments.
// See https://willhart.io/post/tauri-create-react-app-tutorial-part3/

const invokeFetcher = async <TArgs extends Record<string, any>, TResult>(
   command: string,
   args: TArgs
): Promise<TResult> => {
   window.console.log("invoke", command, args);
   return invoke<TResult>(command, args);
};


/// A hook that invokes a command, and provides local caching, query
/// deduplication, and so on.
/// :param args:
//     a passed as parameters to getCommand. If any of these arguments changes
//     the data will be fetched again. Otherwise it might be cached.
//  :param parse:
//     parses the result from the server into the final result
//  :param placeholder:
//     the initial value returned before the server has anything to return
//  :param setCommand:
//     a command that accepts a TResult and is used to update data on the
//     server. When this is called, we will automatically reload the data
//     from the server, after the update, if revalidateOnUpdate is true.

const useInvoke = <TResult, TArgs extends Record<string, any>, TRawResult>(p: {
   getCommand: string,
   args: TArgs,
   placeholder: TResult,

   parse?: (raw: TRawResult) => TResult,
//   setCommand?: string,
//   revalidateOnUpdate?: boolean,
}) => {
   const { parse } = p;

   // run the invoke command, caching as needed
   const { data, error } = useSWR<TResult | undefined>(
      [p.getCommand, p.args],
      invokeFetcher,
      {
         revalidateOnFocus: false,

         // When moving to another page and back to the original, we will be
         // revalidating (aka re-downloading) data. Setting the following would
         // help, but then it doesn't load the data initially either.
         //    revalidateOnMount: false,
      }
   )

   const [ parsedData, setParsedData ] = React.useState(p.placeholder);
   React.useEffect(
      () => {
         if (parse && data !== undefined) {
            setParsedData(parse(data as unknown as TRawResult));
         }
      },
      [data, parse, p.getCommand]
   );
 
//   // create an update function
//   const update = React.useCallback(
//      async (newData: TResult) => {
//         if (p.setCommand !== undefined) {
//            const result: TSetResult = await invoke(p.setCommand, {...newData});
//            mutate(result, p.revalidateOnUpdate);
//         }
//      },
//      [mutate, p.setCommand, p.revalidateOnUpdate]
//   )
 
   return {
      data: parsedData,
      isLoading: !data && !error,
      error,
//      update,
   }
}

export default useInvoke;

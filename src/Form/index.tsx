import * as React from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import Tooltip, { TooltipFunc } from '@/Tooltip';
import Dropdown from '@/Form/Dropdown';
import classes from '@/services/classes';
import "./Form.scss";

export interface SharedInputProps<T> {
   children?: React.ReactNode;
   disabled?: boolean;
   text?: string;
   style?: React.CSSProperties;
   value?: T;
   tooltip?: TooltipFunc<T>;
}

export const SharedInput =
   (p: SharedInputProps<any> & {textAfter?: boolean, className?: string}) =>
{
   const c = classes(
      p.className,
      p.disabled && 'disabled',
   );
   return (
      <Tooltip tooltip={p.tooltip} tooltipData={p.value} >
         <label
            className={c}
            style={p.style}
         >
            {
               !p.textAfter && p.text && <span>{p.text}:</span>
            }
            {p.children}
            {
               p.textAfter && p.text && <span>{p.text}</span>
            }
         </label>
      </Tooltip>
   );
}

interface InputProps extends SharedInputProps<string> {
   placeholder?: string;
   required?: boolean;
   title?: string;
   onChange?: (val: string) => void;
   type?: 'text' | 'date';
}
export const Input: React.FC<InputProps> = p => {
   const { onChange } = p;
   const localChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
         onChange?.(e.target.value);
      },
      [onChange]
   );
   return (
      <SharedInput className="input" {...p}>
         <input
            disabled={p.disabled}
            onChange={localChange}
            placeholder={p.placeholder}
            required={p.required}
            title={p.title}
            type={p.type ?? 'text'}
            value={p.value}
         />
      </SharedInput>
   );
}

interface NumberInputProps extends SharedInputProps<number> {
   required?: boolean;
   title?: string;
   onChange?: (val: number) => void;
}
export const NumberInput: React.FC<NumberInputProps> = p => {
   const { onChange } = p;
   const localChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
         onChange?.(parseFloat(e.target.value));
      },
      [onChange]
   );
   return (
      <SharedInput className="input" {...p}>
         <input
            disabled={p.disabled}
            onChange={localChange}
            required={p.required}
            title={p.title}
            type="number"
            value={p.value}
         />
      </SharedInput>
   );
}

interface ButtonProps extends SharedInputProps<void> {
   primary?: boolean;
   danger?: boolean;
   className?: string;
   onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}
export const Button: React.FC<ButtonProps> = p => {
   const c = classes(
      'button',
      p.className,
      p.disabled && 'disabled',
      p.primary && 'primary',
      p.danger && 'danger',
   );
   return (
      <button
         className={c}
         disabled={p.disabled}
         style={p.style}
         onClick={p.onClick}
      >
         {p.text}
      </button>
   );
}

interface ButtonBarProps {
   children?: React.ReactNode;
}

export const ButtonBar = (p: ButtonBarProps) => {
   return (
      <div className='button-bar'>
         {p.children}
      </div>
   );
}

interface CheckboxProps extends SharedInputProps<boolean|undefined> {
   value: boolean|undefined;
   onChange?: (val: boolean) => void;
   indeterminate?: boolean;
   required?: boolean;
}
export const Checkbox: React.FC<CheckboxProps> = p => {
   const { onChange } = p;
   const onChangeCb = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
         const val = event.target.checked;  //  must capture synchronously
         onChange?.(val);
      },
      [onChange]
   );
   const indetSetter = React.useCallback(
      (el: HTMLInputElement) => {
         if (el) {
           el.indeterminate = !!p.indeterminate;
         }
      },
      [p.indeterminate]
   );
   return (
      <SharedInput className="checkbox" textAfter={true} {...p}>
         <input
            checked={p.value ?? false}
            disabled={p.disabled}
            ref={indetSetter}
            required={p.required}
            onChange={onChangeCb}
            type="checkbox"
         />
      </SharedInput>
   );
}

export interface TextAreaProps extends SharedInputProps<string> {
   rows: number;
   onChange: (val: string) => void;
   placeholder?: string;
   required?: boolean;
   cols: number;
}

export const TextArea: React.FC<TextAreaProps> = p => {
   const { onChange } = p;
   const localChange = React.useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
         onChange?.(e.target.value);
      },
      [onChange]
   );
   return (
      <SharedInput className="textarea" {...p}>
         <textarea
            disabled={p.disabled}
            onChange={localChange}
            placeholder={p.placeholder}
            required={p.required}
            defaultValue={p.value}
            rows={p.rows}
            cols={p.cols}
         />
      </SharedInput>
   );

}

export interface Option<T> {
   value: T | 'divider';
   text?: string;
   style?: React.CSSProperties;  // when showing the text in the menu
}

export const divider: Option<any> = {value: 'divider'};

export interface SelectProps<T>
   extends React.PropsWithChildren<SharedInputProps<T>>
{
   onChange?: (val: T, e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
   options: Option<T>[];
   required?: boolean;
   direction?: "left" | "right";
   hideArrow?: boolean;
   style?: React.CSSProperties;
   format?: (value: T) => string|undefined;  //  formatting the selected
}

export const Select = <T extends { toString: () => string }> (p: SelectProps<T>) => {
   const ROW_HEIGHT = 20;

   const { onChange } = p;
   const selected = p.options.filter(o => o.value === p.value)[0]
   const getKey = (index: number) => index;
   const getRow = (q: ListChildComponentProps) => {
      const o = p.options[q.index];
      return o.value === 'divider' ? (
         <div className="option divider" style={q.style} />
      ) : (
         <Tooltip tooltip={p.tooltip} tooltipData={o.value} >
            <div
               className={
                  `option${o.value === p.value ? ' selected' : ''}`
               }
               style={q.style}
               onClick={e => onChange?.(o.value as T, e)}
            >
               <span style={o.style}>{o.text ?? o.value.toString()}</span>
            </div>
         </Tooltip>
      );
   }

   // ??? handling of `required`

   return (
      <SharedInput className="select" {...p} >
         <Dropdown
            closeOnInsideClick={true}
            button={() =>
               <>
                  <div className="text" >
                     {
                        (selected?.value !== undefined
                           && selected.value !== "divider"
                           && p.format?.(selected.value))
                        ?? selected?.text
                        ?? selected?.value.toString()
                        ?? ''}
                  </div>
                  {
                     !p.hideArrow &&
                     <div className="icon fa fa-caret-down" />
                  }
               </>
            }
            menu={() =>
               <div
                   style={{height: ROW_HEIGHT * Math.min(p.options.length, 15)}}
               >
                  <AutoSizer>
                    {
                       ({ width, height }) => (
                           <FixedSizeList
                              width={width}
                              height={height}
                              itemCount={p.options.length}
                              itemSize={ROW_HEIGHT}
                              itemKey={getKey}
                           >
                              {getRow}
                           </FixedSizeList>
                       )
                    }
                  </AutoSizer>
               </div>
            }
         />
         {p.children}
      </SharedInput>
   );
}

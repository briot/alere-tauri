import * as React from 'react';
import { Button, Checkbox, Input, Select } from '@/Form';
import RoundButton from '@/RoundButton';
import './StyleGuide.scss';

const StyleContent: React.FC<{}> = p => {
   const form = () => {
      return (
         <form onSubmit={(e) => e.preventDefault()}>
            <fieldset>
               <legend>Fieldset</legend>
               <div className="twocolumn">
                  <div>
                     <Checkbox value={true} text='label' />
                     <Checkbox value={false} text='unchecked' />
                  </div>
                  <div>
                     <Checkbox value={true} text='disabled' disabled={true} />
                     <Checkbox
                        value={true}
                        text='indeterminate'
                        indeterminate={true}
                     />
                  </div>
               </div>
               <Select
                  text="label"
                  value="1"
                  options={[
                     {text: "choice1", value: "1"},
                     {text: "choice2", value: "2"},
                  ]}
               />
               <Select
                  text="disabled"
                  disabled={true}
                  value="1"
                  options={[
                     {text: "choice1", value: "1"},
                     {text: "choice2", value: "2"},
                  ]}
               />
               <Input placeholder="placeholder" text="input" value=""/>
               <Input
                  placeholder="placeholder"
                  disabled={true}
                  value=""
                  text="disabled"
               />
               <Input
                  required={true}
                  text="invalid"
                  placeholder="required"
                  value=""
               />
               <div className="wrappedRow">
                  <Button text="label" />
                  <Button text="primary" primary={true} />
                  <Button text="danger" danger={true} />
                  <Button text="disabled" disabled={true} />
                  <Button text="disabled" disabled={true} primary={true}/>
                  <Button text="neumorphism" className="morph"/>
                  <Button text="neumorph disabled" className="morph" disabled={true}/>
               </div>
            </fieldset>
         </form>
      );
   }

   const roundbutton = () => {
      return (
         <>
            <div className="wrappedRow">
               <RoundButton fa="fa-book" size="large"  text="L" url="#"/>
               <RoundButton fa="fa-book" size="normal" text="N" url="#"/>
               <RoundButton fa="fa-book" size="small"  text="S" url="#"/>
               <RoundButton fa="fa-book" size="tiny"   text="T" url="#"/>
            </div>
            <div className="wrappedRow">
               <RoundButton fa="fa-book" size="large"  disabled={true} text="L" />
               <RoundButton fa="fa-book" size="normal" disabled={true} text="N" />
               <RoundButton fa="fa-book" size="small"  disabled={true} text="S" />
               <RoundButton fa="fa-book" size="tiny"   disabled={true} text="T" />
            </div>
            <div className="wrappedRow">
               <RoundButton fa="fa-book" size="large"  selected={true} text="L" />
               <RoundButton fa="fa-book" size="normal" selected={true} text="N" />
               <RoundButton fa="fa-book" size="small"  selected={true} text="S" />
               <RoundButton fa="fa-book" size="tiny"   selected={true} text="T" />
            </div>
         </>
      );
   }

   const text = () => {
      return (
         <div>
            <p>
Sussex result matter any end see. It speedily me addition weddings vicinity in
pleasure. Happiness commanded an conveying breakfast in.  Regard her say
warmly elinor.
            </p>
            <p lang="it">
Sussex result matter any end see. It speedily me addition weddings vicinity in
pleasure. Happiness commanded an conveying breakfast in.  Regard her say
warmly elinor.
            </p>
            <h1>H1 title</h1>
            <h2>H2 title</h2>
            <h3>H3 title</h3>
            <h4>H4 title</h4>
            <h5>H5 title</h5>
            <h6>H6 title</h6>
         </div>
      );
   }

   return (
      <>
         <h4>Palette</h4>
         {
            [
               "red", "pink", "purple", "indigo", "blue", "cyan", "teal",
               "green", "yellow", "orange",

               "",

               "red-mantine", "pink-mantine", "grape-mantine", "violet-mantine",
               "indigo-mantine", "blue-mantine", "cyan-mantine", "teal-mantine",
               "green-mantine", "lime-mantine", "yellow-mantine",
               "orange-mantine",

               "",

               "gray",
            ].map(color =>
               <div className="palette">
               {
                  color === ""
                  ? <div />
                  : Array.from(Array(9).keys()).map((_, variant) =>
                     <div
                        style={{
                           background: `var(--${color}-${(variant +1) * 100})`,
                           color: `var(--fg-${color}-${(variant + 1) * 100})`
                        }}
                     >
                        {color}-{(variant + 1) * 100}
                     </div>
                  )
               }
               </div>
            )
         }

         <h4>Forms</h4>
         <div className="twocolumn">
            <div className="panel">
               {form()}
            </div>
            <div>
               {form()}
            </div>
         </div>

         <h4>Round buttons</h4>
         <div className="twocolumn">
            <div className="panel">
               {roundbutton()}
            </div>
            <div>
               {roundbutton()}
            </div>
         </div>

         <h4>Text</h4>
         <div className="twocolumn">
            <div className="panel">
               {text()}
            </div>
            <div>
               {text()}
            </div>
         </div>
      </>
   );
}

const StyleGuide: React.FC<{}> = p => {
   return (
      <div className="styleguide not_neumorph_mode">
         <div className="page darkpalette">
            <StyleContent />
         </div>
         <div className="page lightpalette">
            <StyleContent />
         </div>
      </div>
   );
}

export default StyleGuide;

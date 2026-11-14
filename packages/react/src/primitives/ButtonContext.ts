'use client';

import { createContext } from 'react';

// What a container shares with the buttons inside it: a button group's variant, size and
// place in the group, a toolbar's icon button style. It is declared here, below the button
// layer that gives its value a shape (`components/button/ButtonContext`), so that `Overlay`
// can reset it: a dialog, menu or sheet opened from a group or a toolbar isn't part of it.
// (Line comments: a doc block would ship in every module that opens an overlay.)
export const ContainerButtonContext = createContext<object>({});

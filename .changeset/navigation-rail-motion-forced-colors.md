---
'@windmorph/react': patch
---

Navigation: the current item's pill stays visible in forced colours (bar and rail). The modal `NavigationRail` sheet of a hidden rail (`hideOnCollapse`) slides in on the default spatial spring, without leaving a gap at the window edge, and a closing modal sheet stays until it has shrunk or slid away instead of vanishing mid-motion.

---
title: Wafer-map defect classification with Swin-Tiny
kind: project
status: shipped
date: 2026-09-30
tags: [ml]
pitch: Chip factories scan every silicon wafer, and the pattern of faulty chips on it points to what went wrong on the production line. I built a model that sorts those patterns into 8 types automatically, shows which part of the wafer drove each decision, and raises an alarm when the mix of defects suddenly shifts.
summary: Classifies WM-811K wafer maps into 8 defect patterns. An ablation showed that my own stacked imbalance fixes were costing 16 points of macro-F1.
metrics:
  - { value: '0.917', label: 'test macro-F1 (8 classes, 25.5k wafers)' }
  - { value: '+0.16', label: 'macro-F1 from removing double rebalancing' }
  - { value: '0', label: 'false drift alarms; shift flagged on the first batch' }
stack: [PyTorch, timm, Swin Transformer, SciPy, Colab A100]
repo: https://github.com/arihaaant/wafer-defect-swin
---

## Goal

Classify semiconductor wafer maps into defect patterns (Center, Donut, Edge-Loc, Edge-Ring, Loc, Near-full, Random, Scratch) and do well on the rare classes, not just the common ones. The data is heavily imbalanced: Edge-Ring has ~9.7k examples and Near-full has 149.

## Setup

- 25,519 labeled defect wafers from WM-811K, 70/15/15 stratified split, test set evaluated once.
- Swin-Tiny backbone with a classification head and an auxiliary decoder that reconstructs the wafer.
- Focal loss and mixup, 20 epochs, best epoch picked on validation macro-F1. About 8 minutes per run on an A100.

## Results

My first version stacked three fixes for the imbalance: a balanced sampler, inverse-frequency class weights and focal loss. Ablating them:

| run | test macro-F1 |
|---|---|
| no extra rebalancing (focal loss only) | **0.917** |
| balanced sampler only | 0.908 |
| class weights only | 0.794 |
| sampler + class weights | 0.753 |

Using the sampler and the class weights together corrects for the imbalance twice. The model then over-predicts rare classes: Scratch reached 0.97 recall but only 0.40 precision. Focal loss alone was enough.

The best model's weak spot is Donut, where 18% of cases are predicted as Loc. The drift monitor (a chi-square test on the predicted class mix) raised no false alarms on normal traffic and flagged a simulated process shift on the first batch after it started.

## Errata

- One seed per config. The gap between the top two runs is small enough to need a few seeds before calling it.
- Mixup was only ablated with both rebalancing methods on, so its effect in the best config is unknown.
- The "attention" map is a stage-activation proxy, not true attention rollout.

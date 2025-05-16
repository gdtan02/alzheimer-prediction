import os
import io
import base64
import pandas as pd
import numpy as np
import matplotlib

matplotlib.use('Agg') # Non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
from typing import OrderedDict, Optional, Dict, Any, List, Tuple
from matplotlib.figure import Figure
from matplotlib.axes import Axes
from matplotlib.path import Path
from matplotlib.spines import Spine
from matplotlib.transforms import Affine2D
from matplotlib.projections import register_projection
from matplotlib.gridspec import GridSpec

from app.config import Config
from app.pipeline import DataPreprocessor, Predictor
from app.core.exceptions import DataPreprocessingError

class VisualizationService:
    """Service for generating data visualizations."""

    def __init__(self):
        self.preprocessor = DataPreprocessor()
        self.predictor = Predictor()
        self._setup_style()
        self._setup_mappings()

    def _setup_style(self):
        """Set up the visual style for all plots."""
        self.palette = "RdYlBu_r"
        sns.set_theme(style="whitegrid", palette="deep", font_scale=1.1)
        plt.rcParams['figure.figsize'] = (12, 8)
        plt.rcParams['axes.labelsize'] = 12
        plt.rcParams['axes.titlesize'] = 14
        plt.rcParams['xtick.labelsize'] = 10
        plt.rcParams['ytick.labelsize'] = 10
        plt.rcParams['font.family'] = 'sans-serif'
        plt.rcParams['font.sans-serif'] = ['Arial', 'Helvetica']

    def _setup_mappings(self):
        """Set up label mappings for categorical variables."""
        self.target_labels_display = OrderedDict({
            1: "Normal cognition",
            2: "Impaired-not-MCI",
            3: "MCI",
            4: "Dementia"
        })
        
        self.sorted_target_labels = [self.target_labels_display[i] for i in sorted(self.target_labels_display.keys())]

        self.color_palette = {
            1: "#2ecc71",  # Green for normal
            2: "#3498db",  # Blue for impaired
            3: "#f39c12",  # Orange for MCI
            4: "#e74c3c"   # Red for dementia
        }
        
        self.sex_labels = {1: "Male", 2: "Female"}
        self.amndem_labels = {0: "No", 1: "Yes", 8: "No diagnosis"}
        self.dysill_labels = {0: "No", 1: "Yes"}
        self.amylpet_labels = {0: "No", 1: "Yes"}
        
        self.feature_display_labels = {
            "AGE": "Age (years)",
            "EDUC": "Years of Education",
            "UDSBENTC": "Benson Figure Score",
            "MOCATRAI": "MoCA Trails",
            "AMNDEM": "Amnestic Dementia",
            "NACCPPAG": "PPA Subtype",
            "AMYLPET": "Amyloid PET",
            "DYSILL": "Medical Illness",
            "DYSILLIF": "Medical Illness Cause",
            "NACCUDSD": "Cognitive Status"
        }

        self.label_col_names = {
            'NACCUDSD': 'TARGET_LABEL',
            'SEX': 'SEX_LABEL',
            'AMNDEM': 'AMNDEM_LABEL',
            'DYSILL': 'DYSILL_LABEL',
            'AMYLPET': 'AMYLPET_LABEL'
        }

    def _get_feature_label(self, feature_key: str) -> str:
        return self.feature_display_labels.get(feature_key, feature_key)
    
    def _get_predictions(self, df: pd.DataFrame, model_name: str) -> pd.DataFrame:
        df = df.copy()
        
        df = self.preprocessor.prepare_prediction_data(df)

        X, _ = self.preprocessor.transform(df)

        self.predictor.set_best_model(best_model_name=model_name)

        target = self.predictor.get_prediction_results(X)
        df["NACCUDSD"] = target

        return df

    def _prepare_data(self, df: pd.DataFrame, model_name: str) -> pd.DataFrame:
        """Prepare the dataframe with label mappings."""
        df = df.copy()

        df = self._get_predictions(df, model_name=model_name)

        # Add label columns
        df['TARGET_LABEL'] = df['NACCUDSD'].map(self.target_labels_display)
        df['SEX_LABEL'] = df['SEX'].map(self.sex_labels)
        df['AMNDEM_LABEL'] = df['AMNDEM'].map(self.amndem_labels)
        df['DYSILL_LABEL'] = df['DYSILL'].map(self.dysill_labels)
        df['AMYLPET_LABEL'] = df['AMYLPET'].map(self.amylpet_labels)
        
        return df
    
    def _fig_to_base64(self, fig: Figure) -> str:
        """Convert matplotlib figure to base64 string."""
        img_buffer = io.BytesIO()
        fig.savefig(img_buffer, format='png', dpi=300, bbox_inches='tight', 
                   facecolor='white', edgecolor='none')
        img_buffer.seek(0)
        img_string = base64.b64encode(img_buffer.getvalue()).decode()
        plt.close(fig)
        return img_string
    
    # def get_target_distribution(self, df: pd.DataFrame) -> str:
    #     """Generate target distribution plot."""
    #     df_viz = self._prepare_data(df)
        
    #     fig, ax = plt.subplots(1, 1, figsize=(10, 8))
        
    #     # Count plot
    #     sns.countplot(
    #         x='TARGET_LABEL', 
    #         data=df_viz, 
    #         palette=self.palette,
    #         order=self.sorted_target_labels,
    #         ax=ax
    #     )
        
    #     # Add count and percentage labels
    #     total = len(df_viz)
    #     if total > 0:
    #         for p in ax.patches:
    #             height = p.get_height()
    #             percentage = 100 * height / total
    #             ax.annotate(
    #                 f'{int(height)}\n({percentage:.1f}%)',
    #                 (p.get_x() + p.get_width() / 2., height),
    #                 ha='center', va='bottom', fontsize=12, fontweight='bold'
    #             )
        
    #     ax.set_title("Distribution of Cognitive Status (NACCUDSD)", fontsize=18, fontweight='bold', pad=20)
    #     ax.set_xlabel("Cognitive Status", fontsize=14)
    #     ax.set_ylabel("Count", fontsize=14)
    #     ax.set_xticklabels(ax.get_xticklabels(), rotation=15, ha='right')
    #     ax.tick_params(axis="x", rotation=15)
    #     sns.despine(fig=fig, ax=ax, left=True, bottom=True)
    #     fig.tight_layout()
        
    #     return self._fig_to_base64(fig)
    
    def get_numerical_features_boxplot(self, df: pd.DataFrame, model_name: str) -> str:
        df_viz = self._prepare_data(df, model_name=model_name)
        num_features = Config.NUMERICAL_FEATURES

        # Check if features exist
        missing_features = [f for f in num_features if f not in df_viz.columns]
        if missing_features:
            raise DataPreprocessingError(f"Missing required numerical features for boxplot: {','.join(missing_features)}")
        
        fig, axes = plt.subplots(2, 2, figsize=(14,10))
        axes = axes.flatten()

        for i, col in enumerate(num_features):
            if i >= len(axes): break
            ax = axes[i]
            sns.boxplot(
                x="TARGET_LABEL", y=col, data=df_viz,
                palette=self.palette, order=self.sorted_target_labels,
                width=0.6, showfliers=True, ax=ax
            )

            # Add median values
            if not df_viz.empty and col in df_viz and "TARGET_LABEL" in df_viz:
                try:
                    medians = df_viz.groupby("TARGET_LABEL")[col].median()
                    valid_labels_in_plot = [lbl for lbl in self.sorted_target_labels if lbl in medians.index]
                    for j, plot_label_text in enumerate(valid_labels_in_plot):
                        median_val = medians[plot_label_text]
                        if pd.notna(median_val):
                             ax.text(
                                j, median_val, f'Median: {median_val:.1f}',
                                ha='center', va='bottom', fontsize=9,
                                color='darkblue', fontweight='bold'
                            )
                except Exception as e:
                    print(f"Note: Could not compute/add medians for {col}: {e}")

            ax.set_title(f"{self._get_feature_label(col)} by Cognitive Status", fontsize=14)
            ax.set_xlabel("")
            ax.set_ylabel(self._get_feature_label(col), fontsize=12) 
            ax.tick_params(axis='x', rotation=15)

        # Hide unused subplots
        for j in range(i + 1, len(axes)):
            fig.delaxes(axes[j])

        fig.tight_layout() 
        return self._fig_to_base64(fig)
    
    def get_numerical_features_pairplot(self, df: pd.DataFrame, model_name: str) -> str:
        df_viz = self._prepare_data(df, model_name=model_name)
        num_features = Config.NUMERICAL_FEATURES

        # Check if features exist
        missing_features = [f for f in num_features if f not in df_viz.columns]
        if missing_features:
            raise DataPreprocessingError(f"Missing required numerical features for pairplot: {','.join(missing_features)}")
        
        if 'TARGET_LABEL' in df_viz:
             df_viz['TARGET_LABEL'] = pd.Categorical(df_viz['TARGET_LABEL'], categories=self.sorted_target_labels, ordered=True)

        g = sns.pairplot(
            df_viz, vars=num_features, hue='TARGET_LABEL',
            diag_kind='kde', palette=self.palette,
            plot_kws={'alpha': 0.6, 's': 40, 'edgecolor': 'k', 'linewidth': 0.5},
            diag_kws={'fill': True, 'alpha': 0.6, 'linewidth': 1.5},
            height=2.5, aspect=1.2
        )
        g.figure.suptitle("Pairwise Relationships Between Numerical Features", y=1.02, fontsize=18)
        g.figure.tight_layout()

        return self._fig_to_base64(g.figure)
    
    def get_numerical_features_violin(self, df: pd.DataFrame, model_name: str) -> str:
        df_viz = self._prepare_data(df, model_name=model_name)
        num_features = Config.NUMERICAL_FEATURES

        # Check if features exist
        missing_features = [f for f in num_features if f not in df_viz.columns]
        if missing_features:
            raise DataPreprocessingError(f"Missing required numerical features for violin plot: {','.join(missing_features)}")
        
        fig, axes = plt.subplots(2, 2, figsize=(14,10))
        axes = axes.flatten()

        # Create violin plot
        for i, col in enumerate(num_features):
            if i >= len(axes): break
            ax = axes[i]
            sns.violinplot(
                x="TARGET_LABEL", y=col, data=df_viz, palette=self.palette, order=self.sorted_target_labels, inner="quartile", cut=0, width=0.8, ax=ax
            )

            if not df_viz.empty and col in df_viz and "TARGET_LABEL" in df_viz:
                try:
                    # Add mean markers
                    means = df_viz.groupby("TARGET_LABEL")[col].mean()
                    ymin, ymax = ax.get_ylim()
                    text_y_position = ymax - (ymax - ymin) * 0.05

                    valid_labels_in_plot = [lbl for lbl in self.sorted_target_labels if lbl in means.index]
                    for j, plot_label_text in enumerate(valid_labels_in_plot): 
                        mean_val = means[plot_label_text]
                        if pd.notna(mean_val):
                            ax.scatter(j, mean_val, color='white', s=80, zorder=3, edgecolor='black')
                            ax.scatter(j, mean_val, color='yellow', s=40, zorder=4, marker='*')
                            ax.text(
                                j, text_y_position, f'Mean: {mean_val:.2f}',
                                ha='center', va='top', fontsize=9
                            )
                except Exception as e:
                    print(f"Note: Could not add means for {col}: {e}")

            ax.set_title(f"Distribution of {self._get_feature_label(col)} by Cognitive Status", fontsize=14)
            ax.set_xlabel("")
            ax.set_ylabel(self._get_feature_label(col), fontsize=12)
            ax.tick_params(axis='x', rotation=15) 
        
        for j in range(i + 1, len(axes)):
            fig.delaxes(axes[j])

        fig.tight_layout()
        return self._fig_to_base64(fig)
    
    def get_correlation_heatmap(self, df: pd.DataFrame, model_name: str) -> str:
        df_viz = self._prepare_data(df, model_name=model_name)
        corr_features = Config.FEATURES_WITH_TARGET

        available_corr_features = [f for f in corr_features if f in df_viz.columns]
        if not available_corr_features:
             raise DataPreprocessingError("None of the specified features for correlation heatmap are available.")
        
        # Ensure columns are numeric
        for f in available_corr_features:
            if not pd.api.types.is_numeric_dtype(df_viz[f]):
                try:
                    df_viz[f] = pd.to_numeric(df_viz[f], errors="coerce")
                except Exception as e:
                    print(f"Warning: Could not convert column {f} to numeric for heatmap: {e}")

        df_corr = df_viz[available_corr_features].copy()
        corr_matrix = df_corr.corr()

        fig, ax = plt.subplots(figsize=(12, 10))
        mask = np.triu(np.ones_like(corr_matrix, dtype=bool))

        sns.heatmap(
            corr_matrix, mask=mask, annot=True, fmt=".2f", cmap="coolwarm", vmin=-1, vmax=1, center=0, square=True, linewidths=.5,
            cbar_kws={"shrink": .8}, annot_kws={"size": 9}, ax=ax
        )

        tick_labels = [self._get_feature_label(col) for col in df_corr.columns]
        ax.set_xticks(np.arange(len(tick_labels)) + 0.5)
        ax.set_yticks(np.arange(len(tick_labels)) + 0.5)
        ax.set_xticklabels(tick_labels, rotation=45, ha="right")
        ax.set_yticklabels(tick_labels, rotation=0)
        ax.set_title("Correlation between Features", fontsize=16, pad=20)
        fig.tight_layout()

        return self._fig_to_base64(fig)
    
    def get_categorical_vs_target(self, df: pd.DataFrame, model_name: str) -> str:
        try:
            df_viz = self._prepare_data(df, model_name=model_name)

            if df_viz.empty:
                print("df_viz is empty after _prepare_data in get_categorical_vs_target.")
                # Return a placeholder or error message image
                fig, ax = plt.subplots(figsize=(8, 6))
                ax.text(0.5, 0.5, "No data available for categorical vs target plot.",
                        horizontalalignment='center', verticalalignment='center',
                        fontsize=14, color='red')
                ax.axis('off')
                return self._fig_to_base64(fig)
            

            cat_features = ['SEX', 'AMNDEM', 'AMYLPET', 'DYSILL']

            fig, axes = plt.subplots(2, 2, figsize=(14, 10))
            axes = axes.flatten()

            if len(axes) == 0:
                print("Error: Matplotlib failed to create axes in get_categorical_vs_target.")
                fig, ax = plt.subplots(figsize=(8, 6)) # Create a single placeholder axis
                ax.text(0.5, 0.5, "Plotting error: Could not create axes.",
                    horizontalalignment='center', verticalalignment='center',
                    fontsize=14, color='red')
                ax.axis('off')
                return self._fig_to_base64(fig)

            colors = [plt.cm.get_cmap(self.palette)(j/len(self.target_labels_display)) for j in range(len(self.target_labels_display))]

            plotted_count = 0
            for i, cat_key in enumerate(cat_features):
                if plotted_count >= len(axes): break
                ax = axes[plotted_count]

                cat_label_col_key = cat_key # Use original key for label lookup
                if cat_label_col_key not in self.label_col_names:
                    print(f"Warning: Label column mapping not found for feature key '{cat_key}'. Skipping.")
                    # Clear this axis or add a note
                    ax.text(0.5, 0.5, f"Column '{cat_key}' mapping missing.", horizontalalignment='center', verticalalignment='center', color='gray', fontsize=10)
                    ax.set_title(f"{cat_key} vs Cognitive Status (Skipped)")
                    ax.axis('off')
                    plotted_count += 1
                    continue
                
                cat_label_col = self.label_col_names[cat_label_col_key]

                if cat_label_col not in df_viz.columns or 'TARGET_LABEL' not in df_viz.columns:
                    print(f"Warning: Required columns '{cat_label_col}' or 'TARGET_LABEL' not found in df_viz. Skipping '{cat_key}'.")
                    # Clear this axis or add a note
                    ax.text(0.5, 0.5, f"Required column(s) missing: '{cat_label_col}' or 'TARGET_LABEL'.", horizontalalignment='center', verticalalignment='center', color='gray', fontsize=10)
                    ax.set_title(f"{self._get_feature_label(cat_key)} vs Cognitive Status (Skipped)")
                    ax.axis('off')
                    plotted_count += 1
                    continue

                try: 
                    # Create contingency table
                    cont_table = pd.crosstab(
                        df_viz[cat_label_col], df_viz['TARGET_LABEL'], normalize='index'
                    )

                    # Ensure cont_table columns match sorted_target_labels
                    cont_table = cont_table.reindex(columns=self.sorted_target_labels, fill_value=0)

                    cont_table.plot(kind='bar', stacked=True, ax=ax, color=colors, width=0.7)

                    ax.set_title(f"{self._get_feature_label(cat_key)} vs Cognitive Status", fontsize=14) 
                    ax.set_xlabel(self._get_feature_label(cat_key), fontsize=12)
                    ax.set_ylabel('Proportion', fontsize=12)
                    ax.tick_params(axis='x', rotation=0)

                    if i == len(cat_features) - 1:
                        legend_disp_labels = [self.target_labels_display[k] for k in sorted(self.target_labels_display.keys())]
                        ax.legend(title='Cognitive Status', labels=legend_disp_labels)
                    else:
                        if ax.get_legend() is not None:
                            ax.get_legend().remove()
                        
                    plotted_count += 1

                except Exception as e:
                    print(f"Error plotting '{cat_key}': {e}")
                    # Add an error message to the subplot instead
                    fig, ax = plt.subplots(figsize=(8, 6))
                    ax.text(0.5, 0.5, f"Error plotting: {e}", horizontalalignment='center', verticalalignment='center', color='red', fontsize=10, wrap=True)
                    ax.set_title(f"{self._get_feature_label(cat_key)} vs Cognitive Status (Error)")
                    ax.axis('off')
                    return self._fig_to_base64(fig)

            for j in range(i+1, len(axes)):
                fig.delaxes(axes[j])
            # fig.tight_layout()
            return self._fig_to_base64(fig)
        
        except Exception as e:
            # Catch any other unexpected errors during the process
            print(f"An unexpected error occurred in get_categorical_vs_target: {e}")
            # Return a generic error image
            fig, ax = plt.subplots(figsize=(8, 6))
            ax.text(0.5, 0.5, f"An unexpected error occurred:\n{e}",
                    horizontalalignment='center', verticalalignment='center',
                    fontsize=14, color='red', wrap=True)
            ax.axis('off')
            return self._fig_to_base64(fig)
    
    def get_feature_importance(self, df: pd.DataFrame, model_name: str) -> str:
        df_viz = self._prepare_data(df, model_name=model_name)

        if df_viz.empty:
                print("df_viz is empty after _prepare_data in get_feature_importance.")
                # Return a placeholder or error message image
                fig, ax = plt.subplots(figsize=(8, 6))
                ax.text(0.5, 0.5, "No data available for feature importance plot.",
                        horizontalalignment='center', verticalalignment='center',
                        fontsize=14, color='red')
                ax.axis('off')
                return self._fig_to_base64(fig)
        
        importance_features = Config.FEATURES_WITH_TARGET

        # Ensure NACCUDSD (target) is numeric
        target_col = 'NACCUDSD'
        if target_col not in df_viz.columns or not pd.api.types.is_numeric_dtype(df_viz[target_col]):
                 print(f"Error: Target column '{target_col}' is missing or not numeric.")
                 fig, ax = plt.subplots(figsize=(8, 6))
                 ax.text(0.5, 0.5, f"Target column '{target_col}' missing or not numeric for correlation.",
                        horizontalalignment='center', verticalalignment='center',
                        fontsize=12, color='red', wrap=True)
                 ax.axis('off')
                 return self._fig_to_base64(fig)
        
        available_features_for_corr = [f for f in importance_features if f in df_viz.columns and pd.api.types.is_numeric_dtype(df_viz[f])]

        if not available_features_for_corr:
                 print("Error: No numeric features available for correlation.")
                 fig, ax = plt.subplots(figsize=(8, 6))
                 ax.text(0.5, 0.5, "No numeric features available for correlation.",
                        horizontalalignment='center', verticalalignment='center',
                        fontsize=14, color='red')
                 ax.axis('off')
                 return self._fig_to_base64(fig)

        df_corr_subset = df_viz[available_features_for_corr]
        target_corr = df_corr_subset.corrwith(df_corr_subset[target_col]).abs().sort_values(ascending=False)

        if target_corr.empty or not np.isfinite(target_corr.values).any():
                 print("Warning: Correlation calculation resulted in no finite values.")
                 fig, ax = plt.subplots(figsize=(8, 6))
                 ax.text(0.5, 0.5, "Correlation calculation resulted in no finite values.",
                        horizontalalignment='center', verticalalignment='center',
                        fontsize=14, color='orange', wrap=True)
                 ax.axis('off')
                 return self._fig_to_base64(fig)
        
        fig, ax = plt.subplots(figsize=(10, 6))
        sns.barplot(
            x=target_corr.values,
            y=target_corr.index.map(lambda x: self._get_feature_label(x)),
            palette="viridis", ax=ax
        )

        if not target_corr.empty:
            for i, v in enumerate(target_corr.values):
                # Only add text if value is finite
                if np.isfinite(v):
                    ax.text(v + 0.01, i, f'{v:.3f}', va='center', fontsize=10, fontweight='bold')
        
        ax.set_title('Feature Importance Based on Correlation with Cognitive Status', fontsize=16) 
        ax.set_xlabel('Absolute Correlation', fontsize=14) 
        ax.set_ylabel("")

        max_corr_value = np.nanmax(target_corr.values)
        if np.isfinite(max_corr_value):
            x_limit_upper = max_corr_value + 0.15
        else:
            x_limit_upper = 0.5 # Fallback limit if max is not finite

        ax.set_xlim(0, max(x_limit_upper, 0.15))

        fig.tight_layout() 
        return self._fig_to_base64(fig)